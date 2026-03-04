import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { AppConfigService } from "src/config/config.service";
import { LoggerService } from "src/common/logger/logger.service";
import { Trace } from "src/common/decorators/trace.decorator";

@Injectable()
export class PasswordService {
  constructor(
    private readonly config: AppConfigService,
    private readonly logger: LoggerService
  ) {}

  @Trace("password.hash")
  async hash(password: string): Promise<string> {
    this.logger.debug("Hashing password");

    const hash = bcrypt.hash(password, this.config.password.saltRounds);

    this.logger.debug("Password hashing complete");

    return hash;
  }

  @Trace("password.compare")
  async compare(password: string, hash: string): Promise<boolean> {
    this.logger.debug("Comparing password hash");

    const match = bcrypt.compare(password, hash);

    if(!match) {
      this.logger.warn("Password comparision failed");
    }

    return match;
  }
}