import { describe, expect } from '@jest/globals';
import { Identifier } from '../../../../src/shared/domain/identifier';
import { InterventionTeam } from '../../../../src/interventions/domain/models/InterventionTeam';

describe('InterventionTeam Value Object', () => {
  describe('create', () => {
    it('should create a team with provided member IDs', () => {
      const member1 = Identifier.generate();
      const member2 = Identifier.generate();
      const member3 = Identifier.generate();

      const team = InterventionTeam.create([member1, member2, member3]);

      expect(team).toBeInstanceOf(InterventionTeam);
      expect(team.length).toBe(3);
      expect(team.memberIds).toEqual([member1, member2, member3]);
    });

    it('should create an empty team', () => {
      const team = InterventionTeam.create();

      expect(team.isEmpty()).toBe(true);
      expect(team.length).toBe(0);
    });

    it('should remove duplicate member IDs', () => {
      const member1 = Identifier.create('550e8400-e29b-41d4-a716-446655440000');
      const member2 = Identifier.create('550e8400-e29b-41d4-a716-446655440001');
      const member1Duplicate = Identifier.create(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      const team = InterventionTeam.create([
        member1,
        member2,
        member1Duplicate,
      ]);

      expect(team.length).toBe(2);
      expect(team.memberIds).toHaveLength(2);
    });
  });

  describe('empty', () => {
    it('should create an empty team', () => {
      const team = InterventionTeam.empty();

      expect(team).toBeInstanceOf(InterventionTeam);
      expect(team.isEmpty()).toBe(true);
      expect(team.length).toBe(0);
    });

    it('should return a team with no members', () => {
      const team = InterventionTeam.empty();

      expect(team.memberIds).toEqual([]);
    });
  });

  describe('memberIds', () => {
    it('should return empty array for empty team', () => {
      const team = InterventionTeam.empty();

      expect(team.memberIds).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle single member team', () => {
      const member = Identifier.generate();
      const team = InterventionTeam.create([member]);

      expect(team.length).toBe(1);
      expect(team.isEmpty()).toBe(false);
      expect(team.memberIds).toEqual([member]);
    });

    it('should handle all duplicate members', () => {
      const member = Identifier.create('550e8400-e29b-41d4-a716-446655440000');
      const duplicate1 = Identifier.create(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      const duplicate2 = Identifier.create(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      const team = InterventionTeam.create([member, duplicate1, duplicate2]);

      expect(team.length).toBe(1);
      expect(team.memberIds[0].value).toBe(member.value);
    });
  });
});
