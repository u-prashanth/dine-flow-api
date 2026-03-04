import * as jwt from "jsonwebtoken";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AppConfigService } from "src/config/config.service";
import { LoggerService } from "src/common/logger/logger.service";
import { Trace } from "src/common/decorators/trace.decorator";
import { AdminRole } from "src/domain/auth/admin-role.enum";

export interface JwtPayload {
  sub: string;
  role: AdminRole;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly config: AppConfigService,
    private readonly logger: LoggerService,
  ) {}

  // TODO: Use config to set token expiry duration
  @Trace("jwt.generateAccessToken")
  generateAccessToken(payload: JwtPayload): string {
    this.logger.debug("Generating access token", {
      subject: payload.sub,
      role: payload.role
    });

    const token = jwt.sign(
      payload,
      this.config.jwt.secret,
      {
        expiresIn: "15m"
      }
    );  

    this.logger.debug("Generated access token", {
      subject: payload.sub,
      role: payload.role
    });

    return token;
  }

  // TODO: Use config to set token expiry duration
  @Trace("jwt.generateRefreshToken")
  generateRefreshToken(payload: JwtPayload): string {
    this.logger.debug("Generating refresh token", {
      subject: payload.sub,
      role: payload.role
    });

    const token = jwt.sign(
      payload,
      this.config.jwt.refreshSecret,
      {
        expiresIn: "7d"
      }
    );
    this.logger.debug("Generated refresh token", {
      subject: payload.sub,
      role: payload.role
    });

    return token;
  }

  @Trace("jwt.verifyAccessToken")
  verifyAccessToken(token: string) {
    try {
      this.logger.debug("Verifying access token");

      const decoded = jwt.verify(token, this.config.jwt.secret) as JwtPayload;

      this.logger.debug("Verified access token", {
        subject: decoded.sub
      });

      return decoded;
    } catch(error) {
      this.logger.warn("Invalid access token");

      throw new UnauthorizedException("Invalid access token");
    }
  }

  @Trace("jwt.verifyRefreshToken")
  verifyRefreshToken(token: string) {
    try {
      this.logger.debug("Verifying refresh token");

      const decoded = jwt.verify(token, this.config.jwt.refreshSecret) as JwtPayload;

      this.logger.debug("Verified refresh token", {
        subject: decoded.sub
      });

      return decoded;
    } catch(error) {
      this.logger.warn("Invalid refresh token");

      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}