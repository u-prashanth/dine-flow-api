import { 
  UnauthorizedException, 
  CanActivate, 
  Injectable,
  type ExecutionContext 
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { RequestContextService } from "src/common/context/request-context.service";
import { Trace } from "src/common/decorators/trace.decorator";
import { LoggerService } from "src/common/logger/logger.service";
import { AdminRole } from "src/domain/auth/admin-role.enum";
import { JwtService } from "src/infrastructure/auth/jwt.service";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly context: RequestContextService
  ) {}

  @Trace("adminAuth.guard")
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.access_token;

    if(!token) {
      this.logger.warn("Admin auth failed: missing access token");
      throw new UnauthorizedException("Authentication required");
    }

    let payload: {
      sub: string;
      role: AdminRole
    };

    try {
      payload = this.jwtService.verifyAccessToken(token);
    } catch {
      this.logger.warn("Admin auth failed: invalid token");
      throw new UnauthorizedException("Invalid authentication token");
    }

    request['admin'] = payload;
    this.context.setUserId(payload.sub);

    this.logger.debug("Admin authenticated", {
      adminId: payload.sub,
      role: payload.role
    })

    return true;
  }
}