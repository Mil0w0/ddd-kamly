import { Module } from '@nestjs/common';
import type { DomainEventDispatcherInterface } from '../shared/domain/events';
import { SyncDomainEventDispatcher } from '../shared/infrastructure/events/SyncDomainEventDispatcher';
import type { ClientRepositoryInterface } from './domain/repository/ClientRepository.interface';
import { ClientCreated } from './domain/events/ClientCreated';
import { onClientCreated } from './infrastructure/handlers/ClientCreatedHandler.example';
import { InMemoryClientRepository } from './infrastructure/repositories/InMemoryClientRepository';
import { CreateClientService } from './application/CreateClient.service';
import { GetClientByIdService } from './application/GetClientById.service';
import { ClientsController } from './infrastructure/controllers/Clients.controller';

@Module({
  controllers: [ClientsController],
  providers: [
    {
      provide: 'ClientDomainEventDispatcher',
      useFactory: (): DomainEventDispatcherInterface => {
        const dispatcher = new SyncDomainEventDispatcher();
        dispatcher.register(ClientCreated, onClientCreated);
        return dispatcher;
      },
    },
    {
      provide: 'ClientRepository',
      useFactory: (dispatcher: DomainEventDispatcherInterface) =>
        new InMemoryClientRepository(dispatcher),
      inject: ['ClientDomainEventDispatcher'],
    },
    {
      provide: CreateClientService,
      useFactory: (repo: ClientRepositoryInterface) =>
        new CreateClientService(repo),
      inject: ['ClientRepository'],
    },
    {
      provide: GetClientByIdService,
      useFactory: (repo: ClientRepositoryInterface) =>
        new GetClientByIdService(repo),
      inject: ['ClientRepository'],
    },
  ],
  exports: [CreateClientService, GetClientByIdService],
})
export class ClientsModule {}
