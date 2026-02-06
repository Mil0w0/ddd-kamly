import type {
  DomainEvent,
  DomainEventDispatcherInterface,
} from '../../domain/events';

export type DomainEventHandler<E extends DomainEvent = DomainEvent> = (
  event: E,
) => void | Promise<void>;

export class SyncDomainEventDispatcher implements DomainEventDispatcherInterface {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  register<E extends DomainEvent>(
    eventType: new (...args: unknown[]) => E,
    handler: DomainEventHandler<E>,
  ): this {
    const key = eventType.name;
    const list = this.handlers.get(key) ?? [];
    list.push(handler as DomainEventHandler);
    this.handlers.set(key, list);
    return this;
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const key = event.constructor.name;
    const list = this.handlers.get(key) ?? [];
    for (const handler of list) {
      await Promise.resolve(handler(event));
    }
  }
}
