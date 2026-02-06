import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions';
import { ClientNotFoundException } from '../../../clients/domain/exceptions';
import {
  InterventionCannotBeCancelledException,
  InterventionCannotBeCompletedException,
  InterventionCannotBeStartedException,
} from '../../../interventions/domain/exceptions';

const HTTP_STATUS_MAP: Record<string, number> = {
  [ClientNotFoundException.name]: HttpStatus.NOT_FOUND,
  [InterventionCannotBeStartedException.name]: HttpStatus.CONFLICT,
  [InterventionCannotBeCompletedException.name]: HttpStatus.CONFLICT,
  [InterventionCannotBeCancelledException.name]: HttpStatus.CONFLICT,
};

const DEFAULT_HTTP_STATUS = HttpStatus.BAD_REQUEST;

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      HTTP_STATUS_MAP[exception.constructor.name] ?? DEFAULT_HTTP_STATUS;

    this.logger.debug(
      `Domain exception: ${exception.name} - ${exception.message}`,
    );

    response.status(statusCode).json({
      error: exception.translationKey,
      message: exception.message,
    });
  }
}
