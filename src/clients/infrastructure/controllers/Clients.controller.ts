import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import type { UUID } from 'node:crypto';
import { CreateClientService } from '../../application/CreateClient.service';
import { GetClientByIdService } from '../../application/GetClientById.service';
import { Identifier } from '../../../shared/domain/identifier';

@Controller('clients')
export class ClientsController {
  constructor(
    @Inject(CreateClientService)
    private readonly createClientService: CreateClientService,
    @Inject(GetClientByIdService)
    private readonly getClientByIdService: GetClientByIdService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
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
    },
  ) {
    const client = await this.createClientService.execute(body);
    return {
      id: client.id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      billingAddress: {
        street: client.billingAddress.street,
        city: client.billingAddress.city,
        zipCode: client.billingAddress.zipCode,
        country: client.billingAddress.country,
        additionalInformation: client.billingAddress.additionalInformation,
      },
      createdAt: client.createdAt.toISO(),
      updatedAt: client.updatedAt.toISO(),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const client = await this.getClientByIdService.execute(
      Identifier.create(id as UUID),
    );
    return {
      id: client.id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      billingAddress: {
        street: client.billingAddress.street,
        city: client.billingAddress.city,
        zipCode: client.billingAddress.zipCode,
        country: client.billingAddress.country,
        additionalInformation: client.billingAddress.additionalInformation,
      },
      createdAt: client.createdAt.toISO(),
      updatedAt: client.updatedAt.toISO(),
    };
  }
}
