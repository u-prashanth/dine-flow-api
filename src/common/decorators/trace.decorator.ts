import { RequestContextService } from "../context/request-context.service";
import { LoggerService } from "../logger/logger.service";
import { TracingHelper } from "../tracing/tracing.helper";

export function Trace(spanName?: string): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context: RequestContextService = TracingHelper.getRequestContext();
      const logger: LoggerService = TracingHelper.getLogger();
      const name = spanName || String(propertyKey);
      context.startSpan(name);

      try {
        const result = await originalMethod.apply(this, args);

        const spanInfo = context.endSpan();

        logger.debug('Span completed', {
          traceId: context.traceId,
          spanId: spanInfo.spanId,
          parentSpanId: context.parentSpanId,
          name: spanInfo.name,
          durationMs: spanInfo.durationMs
        });

        return result;
      } catch (error) {
        const spanInfo = context.endSpan();

        logger.warn('Span failed', {
          traceId: context.traceId,
          spanId: spanInfo.spanId,
          parentSpanId: context.parentSpanId,
          name: spanInfo.name,
          durationMs: spanInfo.durationMs
        });

        throw error;
      }
    }

    return descriptor;
  }
}