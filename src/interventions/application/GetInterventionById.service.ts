import { Identifier } from '../../shared/domain/identifier';
import { Intervention } from '../domain/models/intervention';
import { InterventionNotFoundException } from '../domain/exceptions';
import type { InterventionRepositoryInterface } from '../domain/repository/InterventionRepository.interface';

export class GetInterventionByIdService {
  constructor(
    private readonly interventionRepository: InterventionRepositoryInterface,
  ) {}

  async execute(id: Identifier): Promise<Intervention> {
    const intervention = await this.interventionRepository.findById(id);
    if (intervention === null) {
      throw new InterventionNotFoundException(id);
    }
    return intervention;
  }
}
