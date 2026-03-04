import { Injectable } from "@nestjs/common";
import { logger } from "./logger";
import { RequestContextService } from "../context/request-context.service";

@Injectable()
export class LoggerService {
  constructor(private readonly context: RequestContextService) {}

  info(message: string, meta?: Record<string, unknown>) {
    logger.info(
      {
        traceId: this.context.traceId,
        userId: this.context.userId,
        ...meta
      },
      message
    );
  }

  error(message: string, meta?: Record<string, unknown>) {
    logger.error(
      {
        traceId: this.context.traceId,
        userId: this.context.userId,
        ...meta
      },
      message
    );
  }

  warn(message: string, meta?: Record<string, unknown>) {
    logger.warn(
      {
        traceId: this.context.traceId,
        userId: this.context.userId,
        ...meta
      },
      message
    );
  }

  debug(message: string, meta?: Record<string, unknown>) {
    logger.debug(
      {
        traceId: this.context.traceId,
        userId: this.context.userId,
        ...meta
      },
      message
    );
  }

  request(message: string, req: Request, meta?: Record<string, unknown>) {
    logger.info(
      {
        request: req['traceId'],
        ...meta
      },
      message
    )
  }
}