import type { Response } from "express";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { AdminAuthService } from "src/application/auth/services/admin-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { LoggerService } from "src/common/logger/logger.service";
import { AuthConstant } from "src/common/constants/auth.constants";

@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly logger: LoggerService
  ) {}

  @Post("login")
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    this.logger.info("Admin login request received", {
      email: dto.email
    });

    const {
      accessToken,
      refreshToken
    } = await this.adminAuthService.login(
      dto.email,
      dto.password
    );

    // TODO: configure cookie settings via config
    res.cookie(AuthConstant.ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie(AuthConstant.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    this.logger.info("Admin auth cookies issued");

    return {
      success: true
    };
  }
}