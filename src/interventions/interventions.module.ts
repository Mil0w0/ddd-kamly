import { Module } from '@nestjs/common';
import type { DomainEventDispatcherInterface } from '../shared/domain/events';
import { SyncDomainEventDispatcher } from '../shared/infrastructure/events/SyncDomainEventDispatcher';
import type { InterventionRepositoryInterface } from './domain/repository/InterventionRepository.interface';
import {
  InterventionPlanned,
  TeamMemberAddedToIntervention,
} from './domain/events';
import {
  CheckTeamAvailabilityService,
  PlanInterventionService,
} from './domain/services';
import { AddPlumberToInterventionService } from './application/AddPlumberToIntervention.service';
import { CancelInterventionService } from './application/CancelIntervention.service';
import { CompleteInterventionService } from './application/CompleteIntervention.service';
import { GetInterventionByIdService } from './application/GetInterventionById.service';
import { StartInterventionService } from './application/StartIntervention.service';
import { onInterventionPlanned } from './infrastructure/handlers/InterventionPlannedHandler.example';
import { onTeamMemberAddedToIntervention } from './infrastructure/handlers/TeamMemberAddedToInterventionHandler.example';
import { InterventionsController } from './infrastructure/controllers/Interventions.controller';
import { InMemoryInterventionRepository } from './infrastructure/repositories/InMemoryInterventionRepository';

@Module({
  controllers: [InterventionsController],
  providers: [
    {
      provide: 'DomainEventDispatcher',
      useFactory: (): DomainEventDispatcherInterface => {
        const dispatcher = new SyncDomainEventDispatcher();
        dispatcher.register(InterventionPlanned, onInterventionPlanned);
        dispatcher.register(
          TeamMemberAddedToIntervention,
          onTeamMemberAddedToIntervention,
        );
        return dispatcher;
      },
    },
    {
      provide: 'InterventionRepository',
      useFactory: (dispatcher: DomainEventDispatcherInterface) =>
        new InMemoryInterventionRepository(dispatcher),
      inject: ['DomainEventDispatcher'],
    },
    {
      provide: CheckTeamAvailabilityService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new CheckTeamAvailabilityService(repo),
      inject: ['InterventionRepository'],
    },
    {
      provide: PlanInterventionService,
      useFactory: (
        repo: InterventionRepositoryInterface,
        checkTeamAvailability: CheckTeamAvailabilityService,
      ) => new PlanInterventionService(repo, checkTeamAvailability),
      inject: ['InterventionRepository', CheckTeamAvailabilityService],
    },
    {
      provide: AddPlumberToInterventionService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new AddPlumberToInterventionService(repo),
      inject: ['InterventionRepository'],
    },
    {
      provide: GetInterventionByIdService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new GetInterventionByIdService(repo),
      inject: ['InterventionRepository'],
    },
    {
      provide: StartInterventionService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new StartInterventionService(repo),
      inject: ['InterventionRepository'],
    },
    {
      provide: CompleteInterventionService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new CompleteInterventionService(repo),
      inject: ['InterventionRepository'],
    },
    {
      provide: CancelInterventionService,
      useFactory: (repo: InterventionRepositoryInterface) =>
        new CancelInterventionService(repo),
      inject: ['InterventionRepository'],
    },
  ],
  exports: [
    CheckTeamAvailabilityService,
    PlanInterventionService,
    AddPlumberToInterventionService,
    GetInterventionByIdService,
    StartInterventionService,
    CompleteInterventionService,
    CancelInterventionService,
  ],
})
export class InterventionsModule {}
