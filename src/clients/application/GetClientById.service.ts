import { Identifier } from '../../shared/domain/identifier';
import { Client } from '../domain/models/client';
import { ClientNotFoundException } from '../domain/exceptions';
import type { ClientRepositoryInterface } from '../domain/repository/ClientRepository.interface';

export class GetClientByIdService {
  constructor(private readonly clientRepository: ClientRepositoryInterface) {}

  async execute(id: Identifier): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (client === null) {
      throw new ClientNotFoundException(id);
    }
    return client;
  }
}
