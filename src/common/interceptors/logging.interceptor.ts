import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { Observable, tap } from "rxjs";
import { Request } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;

          this.logger.info('HTTP Request Completed', {
            method,
            url: originalUrl,
            durationMs: duration
          });
        },
        error: (error) => {
          const duration = Date.now() - start;

          this.logger.error('HTTP Request Failed', {
            method,
            url: originalUrl,
            durationMs: duration,
            error: error?.message
          });
        }
      })
    )
  }
}