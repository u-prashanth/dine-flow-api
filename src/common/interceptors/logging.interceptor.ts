import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { Observable, tap } from "rxjs";
import { Request, Response } from "express";
import { RequestContextService } from "../context/request-context.service";
import { MetricsService } from "../metrics/metrics.service";

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
    const traceId = this.requestContext.traceId;

    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const spanInfo = this.requestContext.endSpan();
          const statusCode = response.statusCode;

          try {
            this.metrics.recordHttpRequest(statusCode);
            this.metrics.recordHttpLatency(spanInfo.durationMs);
          } catch(metricError) {
            this.logger.error('Metrics increment failed', {
              traceId,
              metricError
            });
          }

          this.logger.info('HTTP Request Completed', {
            traceId,
            spanId: spanInfo.spanId,
            durationMs: spanInfo.durationMs,
            statusCode,
            method,
            url: originalUrl
          });
        },
        error: () => {
          const spanInfo = this.requestContext.endSpan();
          const statusCode = response.statusCode;

          try {
            this.metrics.recordHttpRequest(statusCode);
            this.metrics.recordHttpLatency(spanInfo.durationMs);
          } catch(metricError) {
            this.logger.error('Metrics increment failed', {
              traceId,
              metricError
            });
          }

          this.logger.warn('HTTP Request Failed', {
            traceId,
            spanId: spanInfo.spanId,
            durationMs: spanInfo.durationMs,
            statusCode,
            method,
            url: originalUrl
          });
        }
      })
    )
  }
}