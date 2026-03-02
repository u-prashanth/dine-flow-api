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

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContext: RequestContextService
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = this.requestContext.requestId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';
    let details: unknown = null;

    if(exception instanceof BaseException) {
      status = exception.getStatus();
      errorCode = exception.errorCode;
      message = exception.message;
      details = exception.details ?? null;

      this.logger.warn('Application error', {
        requestId,
        path: request.url,
        errorCode,
        message
      });
    } else if(exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = ErrorCode.VALIDATION_ERROR;

      this.logger.warn('HTTP exception', {
        requestId,
        path: request.url,
        message
      });
    } else {
      this.logger.error('Unhandled exception', {
        requestId,
        path: request.url,
        error: exception
      });
    }

    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: errorCode,
        message,
        details
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString
      }
    });
  }
}