import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

interface Span {
  spanId: string;
  name?: string;
  startTime: bigint;
}

interface SpanInfo {
  durationMs: number;
  spanId: string;
  name: string;
}

interface RequestStore {
  traceId: string;
  userId?: string;
  spanStack: Span[];
}

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

  run<T>(callback: () => T): T {
    const traceId = randomUUID();

    const rootSpan: Span = {
      spanId: randomUUID(),
      name: 'root',
      startTime: process.hrtime.bigint()
    }

    const store: RequestStore = {
      traceId,
      spanStack: [rootSpan]
    }

    return this.asyncLocalStorage.run(store, callback);
  }

  get traceId(): string {
    return this.getStore().traceId;
  }

  get currentSpanId(): string | undefined {
    const stack = this.getStore().spanStack;
    return stack[stack.length - 1]?.spanId;
  }

  get parentSpanId(): string | undefined {
    const stack = this.getStore().spanStack;
    if(stack.length < 2) return undefined;
    return stack[stack.length - 2].spanId;
  }

  startSpan(name: string): string {
    const store = this.getStore();

    const span: Span = {
      spanId: randomUUID(),
      name,
      startTime: process.hrtime.bigint()
    };

    store.spanStack.push(span);

    return span.spanId;
  }

  endSpan(): SpanInfo {
    const store = this.getStore();

    if(store.spanStack.length === 0) {
      throw new Error("No active span to end");
    }

    const span = store.spanStack.pop()!;
    const durationMs = Number(process.hrtime.bigint() - span.startTime) / 1_000_000;

    return {
      durationMs,
      spanId: span.spanId,
      name: span.name!
    };
  }

  get userId(): string | undefined {
    return this.getStore().userId;
  }

  setUserId(userId: string) {
    this.getStore().userId = userId;
  }

  private getStore(): RequestStore {
    const store = this.asyncLocalStorage.getStore();

    if(!store) {
      throw new Error("Request context not initialized");
    }

    return store
  }
}