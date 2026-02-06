import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import { Identifier } from '../../../shared/domain/identifier';

export class InterventionNotFoundException extends DomainException {
  readonly translationKey = 'intervention.error.not_found';

  constructor(private readonly _interventionId: Identifier) {
    super(`Intervention ${_interventionId.toString()} not found`);
  }

  get interventionId(): Identifier {
    return this._interventionId;
  }
}
