import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { RequestContextService } from "../context/request-context.service";
import { MetricsService } from "../metrics/metrics.service";
import { MetricName } from "../metrics/metrics.enum";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
    private readonly metrics: MetricsService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const requestId = this.requestContext.requestId;

    const { method, originalUrl } = request;
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
          const statusCode = response.statusCode;

          try {
            this.metrics.recordHttpRequest(statusCode);
          } catch(metricError) {
            this.logger.error('Metrics increment failed', {
              requestId,
              metricError
            });
          }

          this.logger.info('HTTP Request Completed', {
            requestId,
            method,
            url: originalUrl,
            statusCode,
            durationMs: duration
          });
        },
        error: (error) => {
          const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
          const statusCode = response.statusCode;

          try {
            this.metrics.recordHttpFailure(statusCode);
          } catch(metricError) {
            this.logger.error('Metrics increment failed', {
              requestId,
              metricError
            });
          }

          this.logger.warn('HTTP Request Failed', {
            requestId,
            method,
            url: originalUrl,
            statusCode,
            durationMs: duration
          });
        }
      })
    )
  }
}