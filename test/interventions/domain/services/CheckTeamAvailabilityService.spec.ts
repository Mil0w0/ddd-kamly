import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../../src/shared/domain/identifier';
import { Address } from '../../../../src/shared/domain/address';
import { Intervention } from '../../../../src/interventions/domain/models/intervention';
import { InterventionTeam } from '../../../../src/interventions/domain/models/InterventionTeam';
import { InterventionType } from '../../../../src/interventions/domain/models/InterventionType';
import { CheckTeamAvailabilityService } from '../../../../src/interventions/domain/services/CheckTeamAvailabilityService';
import { TeamNotAvailableException } from '../../../../src/interventions/domain/exceptions/TeamNotAvailableException';
import { InMemoryInterventionRepository } from '../../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('CheckTeamAvailabilityService (Domain Service)', () => {
  let repository: InMemoryInterventionRepository;
  let service: CheckTeamAvailabilityService;
  let member1: Identifier;
  let member2: Identifier;
  let clientId: Identifier;
  let billableClientId: Identifier;
  let address: Address;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    service = new CheckTeamAvailabilityService(repository);
    member1 = Identifier.generate();
    member2 = Identifier.generate();
    clientId = Identifier.generate();
    billableClientId = Identifier.generate();
    address = Address.create({
      street: '10 Rue Test',
      city: 'Lyon',
      zipCode: '69001',
      country: 'France',
    });
  });

  describe('isTeamAvailable', () => {
    it('returns true when no ongoing interventions exist for the team', async () => {
      const available = await service.isTeamAvailable([member1, member2]);
      expect(available).toBe(true);
    });

    it('returns true when member list is empty', async () => {
      const available = await service.isTeamAvailable([]);
      expect(available).toBe(true);
    });

    it('returns false when at least one team member has an ongoing intervention', async () => {
      const team = InterventionTeam.create([member1, member2]);
      const intervention = Intervention.create({
        type: InterventionType.MAINTENANCE,
        address,
        clientID: clientId,
        billableClientID: billableClientId,
        team,
      });
      intervention.start();
      await repository.save(intervention);

      const available = await service.isTeamAvailable([member1, member2]);
      expect(available).toBe(false);
    });

    it('returns true when existing interventions are PLANNED or COMPLETED (not ONGOING)', async () => {
      const team = InterventionTeam.create([member1]);
      const intervention = Intervention.create({
        type: InterventionType.MAINTENANCE,
        address,
        clientID: clientId,
        billableClientID: billableClientId,
        team,
      });
      await repository.save(intervention);

      const available = await service.isTeamAvailable([member1]);
      expect(available).toBe(true);
    });
  });

  describe('assertTeamAvailable', () => {
    it('does not throw when team has no ongoing interventions', async () => {
      await expect(
        service.assertTeamAvailable([member1, member2]),
      ).resolves.not.toThrow();
    });

    it('throws TeamNotAvailableException when team has ongoing intervention', async () => {
      const team = InterventionTeam.create([member1, member2]);
      const intervention = Intervention.create({
        type: InterventionType.EMERGENCY,
        address,
        clientID: clientId,
        billableClientID: billableClientId,
        team,
      });
      intervention.start();
      await repository.save(intervention);

      await expect(
        service.assertTeamAvailable([member1, member2]),
      ).rejects.toThrow(TeamNotAvailableException);
    });

    it('does not throw when member list is empty', async () => {
      await expect(service.assertTeamAvailable([])).resolves.not.toThrow();
    });
  });
});
