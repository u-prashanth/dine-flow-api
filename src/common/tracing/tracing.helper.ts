import { ModuleRef } from "@nestjs/core";
import { RequestContextService } from "../context/request-context.service";
import { LoggerService } from "../logger/logger.service";

export class TracingHelper {
  private static moduleRef: ModuleRef;

  static setModuleRef(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  static getRequestContext(): RequestContextService {
    return this.moduleRef.get(RequestContextService, {
      strict: false
    });
  }

  static getLogger(): LoggerService {
    return this.moduleRef.get(LoggerService, {
      strict: false
    });
  }
}