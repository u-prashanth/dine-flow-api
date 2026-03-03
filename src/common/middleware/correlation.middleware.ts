import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import {v4 as uuidv4} from 'uuid';
import { RequestContextService } from "../context/request-context.service";

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers['x-request-id'] as string) || uuidv4();

    res.setHeader('x-request-id', traceId);

    this.context.run(() => {
      next();
    });
  }
}