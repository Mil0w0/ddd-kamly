import type { DomainEventDispatcherInterface } from '../../../shared/domain/events';
import { Identifier } from '../../../shared/domain/identifier';
import { Intervention } from '../../domain/models/intervention';
import { InterventionStatus } from '../../domain/models/InterventionStatus';
import type { InterventionRepositoryInterface } from '../../domain/repository/InterventionRepository.interface';

export class InMemoryInterventionRepository implements InterventionRepositoryInterface {
  private readonly storage = new Map<string, Intervention>();

  constructor(
    private readonly eventDispatcher?: DomainEventDispatcherInterface,
  ) {}

  findById(id: Identifier): Promise<Intervention | null> {
    return Promise.resolve(this.storage.get(id.value) ?? null);
  }

  async save(intervention: Intervention): Promise<void> {
    this.storage.set(intervention.id.value, intervention);
    if (this.eventDispatcher) {
      const events = intervention.releaseEvents();
      for (const event of events) {
        await this.eventDispatcher.dispatch(event);
      }
    }
  }

  remove(intervention: Intervention): Promise<void> {
    this.storage.delete(intervention.id.value);
    return Promise.resolve();
  }

  async findOngoingByTeamMembers(
    memberIds: Identifier[],
  ): Promise<Intervention[]> {
    if (memberIds.length === 0) {
      return Promise.resolve([]);
    }

    const memberIdSet = new Set(memberIds.map((id) => id.value));
    const result = [...this.storage.values()].filter((intervention) => {
      if (intervention.status !== InterventionStatus.ONGOING) {
        return false;
      }
      const teamMemberIds = intervention.interventionTeam.memberIds;
      return teamMemberIds.some((id) => memberIdSet.has(id.value));
    });
    return Promise.resolve(result);
  }
}
