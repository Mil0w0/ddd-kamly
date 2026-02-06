import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import { Identifier } from '../../../shared/domain/identifier';
import { InterventionStatus } from '../models/InterventionStatus';

export class InterventionCannotBeCompletedException extends DomainException {
  readonly translationKey = 'intervention.error.cannot_be_completed';

  constructor(
    private readonly _interventionId: Identifier,
    private readonly _currentStatus: InterventionStatus,
  ) {
    super(
      `Intervention ${_interventionId.value} cannot be completed from status ${_currentStatus}. Allowed from: ${InterventionStatus.ONGOING}`,
    );
  }

  get interventionId(): Identifier {
    return this._interventionId;
  }

  get currentStatus(): InterventionStatus {
    return this._currentStatus;
  }
}
