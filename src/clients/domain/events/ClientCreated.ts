import { DateTime } from 'luxon';
import type { DomainEvent } from '../../../shared/domain/events';
import type { Identifier } from '../../../shared/domain/identifier';

export class ClientCreated implements DomainEvent {
  constructor(
    public readonly clientId: Identifier,
    public readonly name: string,
    public readonly email: string,
    public readonly occurredOn: DateTime = DateTime.now(),
  ) {}
}
