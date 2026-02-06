import { Identifier } from '../../../shared/domain/identifier';
import { Client } from '../models/client';

export interface ClientRepositoryInterface {
  findById(id: Identifier): Promise<Client | null>;

  save(client: Client): Promise<void>;

  remove(client: Client): Promise<void>;

  findAll(): Promise<Client[]>;
}
