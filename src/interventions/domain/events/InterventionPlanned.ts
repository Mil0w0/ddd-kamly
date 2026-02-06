import { DateTime } from 'luxon';
import type { DomainEvent } from '../../../shared/domain/events';
import type { Identifier } from '../../../shared/domain/identifier';
import type { InterventionType } from '../models/InterventionType';

export class InterventionPlanned implements DomainEvent {
  constructor(
    public readonly interventionId: Identifier,
    public readonly clientId: Identifier,
    public readonly billableClientId: Identifier,
    public readonly type: InterventionType,
    public readonly occurredOn: DateTime = DateTime.now(),
  ) {}
}
