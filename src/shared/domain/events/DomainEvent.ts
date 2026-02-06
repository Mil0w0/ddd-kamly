import { DateTime } from 'luxon';

export interface DomainEvent {
  readonly occurredOn: DateTime;
}
