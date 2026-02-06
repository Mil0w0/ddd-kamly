import { DateTime } from 'luxon';
import type { DomainEvent } from '../../../shared/domain/events';
import type { Identifier } from '../../../shared/domain/identifier';

export class InterventionCompleted implements DomainEvent {
  constructor(
    public readonly interventionId: Identifier,
    public readonly occurredOn: DateTime = DateTime.now(),
  ) {}
}
