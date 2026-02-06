import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import { Identifier } from '../../../shared/domain/identifier';
import { InterventionStatus } from '../models/InterventionStatus';

export class InterventionCannotBeCancelledException extends DomainException {
  readonly translationKey = 'intervention.error.cannot_be_cancelled';

  constructor(
    private readonly _interventionId: Identifier,
    private readonly _currentStatus: InterventionStatus,
  ) {
    super(
      `Intervention ${_interventionId.value} cannot be cancelled from status ${_currentStatus}. Allowed from: ${InterventionStatus.PLANNED}, ${InterventionStatus.ONGOING}`,
    );
  }

  get interventionId(): Identifier {
    return this._interventionId;
  }

  get currentStatus(): InterventionStatus {
    return this._currentStatus;
  }
}
