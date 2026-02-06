import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import type { Identifier } from '../../../shared/domain/identifier';

export class ClientNotFoundException extends DomainException {
  readonly translationKey = 'client.error.not_found';

  constructor(private readonly _clientId: Identifier) {
    super(`Client ${_clientId.toString()} not found`);
  }

  get clientId(): Identifier {
    return this._clientId;
  }
}
