import { DomainException } from '../../../shared/domain/exceptions/DomainException';
import { Identifier } from '../../../shared/domain/identifier';

export class TeamNotAvailableException extends DomainException {
  readonly translationKey = 'intervention.error.team_not_available';

  constructor(
    private readonly _memberIds: readonly Identifier[],
    private readonly _reason?: string,
  ) {
    const ids = _memberIds.map((id) => id.value).join(', ');
    super(
      _reason ??
        `Team with members [${ids}] is not available (has ongoing intervention(s)).`,
    );
  }

  get memberIds(): readonly Identifier[] {
    return this._memberIds;
  }
}
