import { Address } from '../../../shared/domain/address';
import { Identifier } from '../../../shared/domain/identifier';
import { Intervention } from '../models/intervention';
import { InterventionTeam } from '../models/InterventionTeam';
import { InterventionType } from '../models/InterventionType';
import { InterventionRepositoryInterface } from '../repository/InterventionRepository.interface';
import { CheckTeamAvailabilityService } from './CheckTeamAvailabilityService';

export interface PlanInterventionCommand {
  type: InterventionType;
  address: Address;
  clientID: Identifier;
  billableClientID: Identifier;
  teamMemberIds: Identifier[];
}

export class PlanInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepositoryInterface,
    private readonly checkTeamAvailability: CheckTeamAvailabilityService,
  ) {}

  async execute(command: PlanInterventionCommand): Promise<Intervention> {
    await this.checkTeamAvailability.assertTeamAvailable(command.teamMemberIds);

    const team =
      command.teamMemberIds.length > 0
        ? InterventionTeam.create(command.teamMemberIds)
        : InterventionTeam.empty();

    const intervention = Intervention.create({
      type: command.type,
      address: command.address,
      clientID: command.clientID,
      billableClientID: command.billableClientID,
      team,
    });

    await this.interventionRepository.save(intervention);

    return intervention;
  }
}
