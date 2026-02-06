import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';
import { StartInterventionService } from '../../../src/interventions/application/StartIntervention.service';
import {
  InterventionCannotBeStartedException,
  InterventionNotFoundException,
} from '../../../src/interventions/domain/exceptions';
import { InMemoryInterventionRepository } from '../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('StartInterventionService', () => {
  let repository: InMemoryInterventionRepository;
  let startService: StartInterventionService;
  let intervention: Intervention;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    startService = new StartInterventionService(repository);

    const address = Address.create({
      street: '10 Rue Test',
      city: 'Paris',
      zipCode: '75001',
      country: 'France',
    });
    const clientId = Identifier.generate();
    const billableClientId = Identifier.generate();

    intervention = Intervention.create({
      type: InterventionType.MAINTENANCE,
      address,
      clientID: clientId,
      billableClientID: billableClientId,
    });
  });

  it('transitions intervention from PLANNED to ONGOING and persists', async () => {
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await startService.execute(intervention.id);

    expect(updated.status).toBe(InterventionStatus.ONGOING);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.status).toBe(InterventionStatus.ONGOING);
  });

  it('throws InterventionNotFoundException when intervention does not exist', async () => {
    const unknownId = Identifier.generate();

    await expect(startService.execute(unknownId)).rejects.toThrow(
      InterventionNotFoundException,
    );
  });

  it('throws InterventionCannotBeStartedException when intervention is already ONGOING', async () => {
    intervention.start();
    await repository.save(intervention);
    intervention.releaseEvents();

    await expect(startService.execute(intervention.id)).rejects.toThrow(
      InterventionCannotBeStartedException,
    );
  });

  it('throws InterventionCannotBeStartedException when intervention is COMPLETED', async () => {
    intervention.start();
    intervention.complete();
    await repository.save(intervention);
    intervention.releaseEvents();

    await expect(startService.execute(intervention.id)).rejects.toThrow(
      InterventionCannotBeStartedException,
    );
  });
});
