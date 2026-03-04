import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Trace } from "src/common/decorators/trace.decorator";
import { LoggerService } from "src/common/logger/logger.service";
import { AdminRole } from "src/domain/auth/admin-role.enum";
import { JwtService } from "src/infrastructure/auth/jwt.service";
import { PasswordService } from "src/infrastructure/auth/password.service";
import { AdminRepository } from "src/infrastructure/database/repositories/admin.repository";

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService
  ) {}

  @Trace("adminAuth.login")
  async login(email: string, password: string) {
    this.logger.info("Admin login attempt", { email });
    
    const admin = await this.adminRepository.findByEmail(email);

    if(!admin) {
      this.logger.warn("Admin login failed - user not found", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await this.passwordService.compare(
      password,
      admin.passwordHash
    );

    if(!valid) {
      this.logger.warn("Admin login failed - invalid password", {
        adminId: admin.id
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: admin.id,
      role: admin.role as AdminRole
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    this.logger.info("Admin login success", {
      adminId: admin.id,
      role: admin.role
    });

    return {
      accessToken,
      refreshToken
    }
  }
}