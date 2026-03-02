import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { RequestContextService } from "../context/request-context.service";
import { success } from "zod";

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  constructor(private readonly requestContext: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        error: null,
        meta: {
          requestId: this.requestContext.requestId,
          timestamp: new Date().toISOString()
        }
      }))
    );
  }
}