import { Address } from '../../shared/domain/address';
import { Client } from '../domain/models/client';
import type { ClientRepositoryInterface } from '../domain/repository/ClientRepository.interface';

export interface CreateClientCommand {
  name: string;
  email: string;
  phone?: string | null;
  billingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    additionalInformation?: string;
  };
}

export class CreateClientService {
  constructor(private readonly clientRepository: ClientRepositoryInterface) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const billingAddress = Address.create(command.billingAddress);
    const client = Client.create({
      name: command.name,
      email: command.email,
      phone: command.phone,
      billingAddress,
    });
    await this.clientRepository.save(client);
    return client;
  }
}
