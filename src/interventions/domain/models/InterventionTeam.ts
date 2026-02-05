import { Identifier } from '../../../shared/domain/identifier';

export class InterventionTeam {
  private constructor(private readonly _memberIds: readonly Identifier[]) {}

  static create(memberIds: Identifier[] = []): InterventionTeam {
    const unique = [...new Map(memberIds.map((id) => [id.value, id])).values()];
    return new InterventionTeam(unique);
  }

  static empty(): InterventionTeam {
    return new InterventionTeam([]);
  }

  get memberIds(): readonly Identifier[] {
    return this._memberIds;
  }

  get length(): number {
    return this._memberIds.length;
  }

  isEmpty(): boolean {
    return this._memberIds.length === 0;
  }

  addMember(memberId: Identifier): InterventionTeam {
    if (this._memberIds.some((id) => id.equals(memberId))) {
      return this;
    }
    return new InterventionTeam([...this._memberIds, memberId]);
  }

  removeMember(memberId: Identifier): InterventionTeam {
    const filtered = this._memberIds.filter((id) => !id.equals(memberId));
    return new InterventionTeam(filtered);
  }

  equals(other: InterventionTeam): boolean {
    if (!other || this._memberIds.length !== other._memberIds.length) {
      return false;
    }
    return this._memberIds.every((id, i) => id.equals(other._memberIds[i]));
  }

  toArray(): Identifier[] {
    return [...this._memberIds];
  }
}
