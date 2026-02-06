import { Module } from '@nestjs/common';
import type { DomainEventDispatcherInterface } from '../shared/domain/events';
import { SyncDomainEventDispatcher } from '../shared/infrastructure/events/SyncDomainEventDispatcher';
import type { InterventionRepositoryInterface } from './domain/repository/InterventionRepository.interface';
import { InterventionPlanned } from './domain/events/InterventionPlanned';
import { CheckTeamAvailabilityService } from './domain/services/CheckTeamAvailabilityService';
import { PlanInterventionService } from './domain/services/PlanInterventionService';
import { onInterventionPlanned } from './infrastructure/handlers/InterventionPlannedHandler.example';
import { InMemoryInterventionRepository } from './infrastructure/repositories/InMemoryInterventionRepository';

@Module({
  providers: [
    {
      provide: 'DomainEventDispatcher',
      useFactory: (): DomainEventDispatcherInterface => {
        const dispatcher = new SyncDomainEventDispatcher();
        dispatcher.register(InterventionPlanned, onInterventionPlanned);
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
  ],
  exports: [CheckTeamAvailabilityService, PlanInterventionService],
})
export class InterventionsModule {}
