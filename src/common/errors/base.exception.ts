import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "./error-code.enum";

export class BaseException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;

  constructor(
    errorCode: ErrorCode,
    message: string,
    status: HttpStatus,
    details?: unknown
  ) {
    super(message, status);

    this.errorCode = errorCode;
    this.details = details;
  }
}