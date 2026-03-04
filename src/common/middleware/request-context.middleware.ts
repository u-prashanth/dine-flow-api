import { Injectable, NestMiddleware } from "@nestjs/common";
import { RequestContextService } from "../context/request-context.service";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly context: RequestContextService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.context.run(() => {
      next();
    });
  }
}