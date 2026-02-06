import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import { Identifier } from '../../../shared/domain/identifier';
import { InterventionStatus } from '../models/InterventionStatus';

export class InterventionCannotAddTeamMemberException extends DomainException {
  readonly translationKey = 'intervention.error.cannot_add_team_member';

  constructor(
    private readonly _interventionId: Identifier,
    private readonly _currentStatus: InterventionStatus,
  ) {
    super(
      `Cannot add team member to intervention ${_interventionId.value}: invalid status ${_currentStatus}. Allowed: PLANNED, ONGOING`,
    );
  }

  get interventionId(): Identifier {
    return this._interventionId;
  }

  get currentStatus(): InterventionStatus {
    return this._currentStatus;
  }
}
