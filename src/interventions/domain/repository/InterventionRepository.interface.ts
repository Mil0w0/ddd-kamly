import { Identifier } from '../../../shared/domain/identifier';
import { Intervention } from '../models/intervention';

export interface InterventionRepositoryInterface {
  findById(id: Identifier): Promise<Intervention | null>;

  save(intervention: Intervention): Promise<void>;

  remove(intervention: Intervention): Promise<void>;

  findOngoingByTeamMembers(memberIds: Identifier[]): Promise<Intervention[]>;
}
