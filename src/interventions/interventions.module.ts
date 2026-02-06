import { Module } from '@nestjs/common';
import type { InterventionRepositoryInterface } from './domain/repository/InterventionRepository.interface';
import { CheckTeamAvailabilityService } from './domain/services/CheckTeamAvailabilityService';
import { PlanInterventionService } from './domain/services/PlanInterventionService';
import { InMemoryInterventionRepository } from './infrastructure/repositories/InMemoryInterventionRepository';

@Module({
  providers: [
    {
      provide: 'InterventionRepository',
      useClass: InMemoryInterventionRepository,
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
