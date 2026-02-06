import type { DomainEventDispatcherInterface } from '../../../shared/domain/events';
import { Identifier } from '../../../shared/domain/identifier';
import { Client } from '../../domain/models/client';
import type { ClientRepositoryInterface } from '../../domain/repository/ClientRepository.interface';

export class InMemoryClientRepository implements ClientRepositoryInterface {
  private readonly storage = new Map<string, Client>();

  constructor(
    private readonly eventDispatcher?: DomainEventDispatcherInterface,
  ) {}

  findById(id: Identifier): Promise<Client | null> {
    return Promise.resolve(this.storage.get(id.value) ?? null);
  }

  async save(client: Client): Promise<void> {
    this.storage.set(client.id.value, client);
    if (this.eventDispatcher) {
      const events = client.releaseEvents();
      for (const event of events) {
        await this.eventDispatcher.dispatch(event);
      }
    }
  }

  remove(client: Client): Promise<void> {
    this.storage.delete(client.id.value);
    return Promise.resolve();
  }

  findAll(): Promise<Client[]> {
    return Promise.resolve([...this.storage.values()]);
  }
}
