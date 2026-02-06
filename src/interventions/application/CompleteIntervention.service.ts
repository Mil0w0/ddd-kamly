import { Identifier } from '../../shared/domain/identifier';
import { Intervention } from '../domain/models/intervention';
import { InterventionNotFoundException } from '../domain/exceptions';
import type { InterventionRepositoryInterface } from '../domain/repository/InterventionRepository.interface';

export class CompleteInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepositoryInterface,
  ) {}

  async execute(interventionId: Identifier): Promise<Intervention> {
    const intervention =
      await this.interventionRepository.findById(interventionId);
    if (intervention === null) {
      throw new InterventionNotFoundException(interventionId);
    }
    intervention.complete();
    await this.interventionRepository.save(intervention);
    return intervention;
  }
}
