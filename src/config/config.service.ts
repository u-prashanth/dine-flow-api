import { Inject, Injectable } from "@nestjs/common";
import type { AppConfiguration } from "./index";

@Injectable()
export class AppConfigService {
  constructor(
    @Inject('APP_CONFIGURATION')
    private readonly config: AppConfiguration
  ) {}

  get app() {
    return this.config.app;
  }

  get database() {
    return this.config.database;
  }

  get redis() {
    return this.config.redis;
  }

  get jwt() {
    return this.config.jwt;
  }

  get messaging() {
    return this.config.messaging;
  }
}