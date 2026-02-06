import { Identifier } from '../../../shared/domain/identifier';
import { InterventionRepositoryInterface } from '../repository/InterventionRepository.interface';
import { TeamNotAvailableException } from '../exceptions/TeamNotAvailableException';

export class CheckTeamAvailabilityService {
  constructor(
    private readonly interventionRepository: InterventionRepositoryInterface,
  ) {}

  async assertTeamAvailable(memberIds: Identifier[]): Promise<void> {
    if (memberIds.length === 0) {
      return;
    }

    const ongoing = await this.interventionRepository.findOngoingByTeamMembers([
      ...memberIds,
    ]);

    if (ongoing.length > 0) {
      throw new TeamNotAvailableException(
        memberIds,
        `Team has ${ongoing.length} ongoing intervention(s).`,
      );
    }
  }

  async isTeamAvailable(memberIds: Identifier[]): Promise<boolean> {
    if (memberIds.length === 0) {
      return true;
    }

    const ongoing = await this.interventionRepository.findOngoingByTeamMembers([
      ...memberIds,
    ]);

    return ongoing.length === 0;
  }
}
