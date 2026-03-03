import { 
  ArgumentsHost, 
  Catch, 
  ExceptionFilter, 
  HttpException, 
  HttpStatus 
} from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { RequestContextService } from "../context/request-context.service";
import { Request, Response } from "express";
import { ErrorCode } from "../errors/error-code.enum";
import { BaseException } from "../errors/base.exception";
import { AppConfigService } from "src/config/config.service";
import { MetricsService } from "../metrics/metrics.service";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService,
    private readonly config: AppConfigService,
    private readonly metrics: MetricsService
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const isProduction = this.config.app.isProduction;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const traceId = this.requestContext.traceId;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';
    let details: unknown = null;

    if(exception instanceof BaseException) {
      statusCode = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details ?? null;

      this.logger.warn('Application error', {
        traceId,
        path: request.url,
        errorCode,
        message
      });
    } else if(exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      errorCode = this.mapHttpStatusToErrorCode(statusCode);
      const responseBody = exception.getResponse();

      if (
        statusCode === HttpStatus.BAD_REQUEST &&
        typeof responseBody === 'object' &&
        responseBody !== null
      ) {
        const res = responseBody as any;

        if(
          Array.isArray(res.message) && 
          res.message[0]?.property
        ) {
          details = this.parseValidationErrors(res.message);
          message = 'Validation failed';
        } else if (
          Array.isArray(res.message)
        ) {
          details = res.message;
          message = 'Validation failed';
        } else {
          message = res.message || message;
        }
      } else if (typeof responseBody === 'string') {
        message = responseBody;
      }

      this.logger.warn('HTTP exception', {
        traceId,
        path: request.url,
        statusCode,
        message
      });
    } else {
      this.logger.error('Unhandled exception', {
        traceId,
        path: request.url,
        error: exception
      });

      if(!isProduction && exception instanceof Error) {
        message = exception.message;
        details = exception.stack;
      }
    }

    try {
      this.metrics.recordApplicationError(errorCode, statusCode);
    } catch(metricError) {
      this.logger.error('Metrics increment failed', {
        traceId,
        metricError
      });
    }

    response.status(statusCode).json({
      success: false,
      data: null,
      error: {
        code: errorCode,
        message,
        details
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch(status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  private parseValidationErrors(errors: any[]): Record<string, string> {
    const formatted: Record<string, string> = {};

    for(const error of errors) {
      if(error.property && error.constraints) {
        const firstConstraint = Object.values(error.constraints)[0] as string;
        formatted[error.property] = firstConstraint;
      }
    }

    return formatted;
  }
}