import { Identifier } from '../../shared/domain/identifier';
import { Intervention } from '../domain/models/intervention';
import { InterventionNotFoundException } from '../domain/exceptions/InterventionNotFoundException';
import type { InterventionRepositoryInterface } from '../domain/repository/InterventionRepository.interface';

export interface AddPlumberToInterventionCommand {
  interventionId: Identifier;
  plumberId: Identifier;
}

export class AddPlumberToInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepositoryInterface,
  ) {}

  async execute(
    command: AddPlumberToInterventionCommand,
  ): Promise<Intervention> {
    const intervention = await this.interventionRepository.findById(
      command.interventionId,
    );
    if (intervention === null) {
      throw new InterventionNotFoundException(command.interventionId);
    }

    intervention.addTeamMember(command.plumberId);
    await this.interventionRepository.save(intervention);

    return intervention;
  }
}
