import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

interface RequestStore {
  requestId: string;
  userId?: string;
}

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

  run(store: RequestStore, callback: () => void) {
    this.asyncLocalStorage.run(store, callback);
  }

  getStore(): RequestStore | undefined {
    return this.asyncLocalStorage.getStore();
  }

  get requestId(): string | undefined {
    return this.getStore()?.requestId;
  }

  get userId(): string | undefined {
    return this.getStore()?.userId;
  }

  setUserId(userId: string) {
    const store = this.getStore();
    if(store) {
      store.userId = userId;
    }
  }
}