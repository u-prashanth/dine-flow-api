import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { RequestContextService } from "../context/request-context.service";

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
          traceId: this.requestContext.traceId,
          timestamp: new Date().toISOString()
        }
      }))
    );
  }
}