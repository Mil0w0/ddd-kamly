import type { DomainEvent } from './DomainEvent';

export interface DomainEventDispatcherInterface {
  dispatch(event: DomainEvent): Promise<void>;
}
