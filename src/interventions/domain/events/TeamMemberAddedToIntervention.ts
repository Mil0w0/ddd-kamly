import { DateTime } from 'luxon';
import type { DomainEvent } from '../../../shared/domain/events';
import type { Identifier } from '../../../shared/domain/identifier';

export class TeamMemberAddedToIntervention implements DomainEvent {
  constructor(
    public readonly interventionId: Identifier,
    public readonly memberId: Identifier,
    public readonly occurredOn: DateTime = DateTime.now(),
  ) {}
}
