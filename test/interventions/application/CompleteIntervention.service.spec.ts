import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';
import { CompleteInterventionService } from '../../../src/interventions/application/CompleteIntervention.service';
import { InterventionNotFoundException } from '../../../src/interventions/domain/exceptions/InterventionNotFoundException';
import { InterventionCannotBeCompletedException } from '../../../src/interventions/domain/exceptions/InterventionCannotBeCompletedException';
import { InMemoryInterventionRepository } from '../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('CompleteInterventionService', () => {
  let repository: InMemoryInterventionRepository;
  let completeService: CompleteInterventionService;
  let intervention: Intervention;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    completeService = new CompleteInterventionService(repository);

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

  it('transitions intervention from ONGOING to COMPLETED and persists', async () => {
    intervention.start();
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await completeService.execute(intervention.id);

    expect(updated.status).toBe(InterventionStatus.COMPLETED);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.status).toBe(InterventionStatus.COMPLETED);
  });

  it('throws InterventionNotFoundException when intervention does not exist', async () => {
    const unknownId = Identifier.generate();

    await expect(completeService.execute(unknownId)).rejects.toThrow(
      InterventionNotFoundException,
    );
  });

  it('throws InterventionCannotBeCompletedException when intervention is PLANNED', async () => {
    await repository.save(intervention);
    intervention.releaseEvents();

    await expect(completeService.execute(intervention.id)).rejects.toThrow(
      InterventionCannotBeCompletedException,
    );
  });

  it('throws InterventionCannotBeCompletedException when intervention is already COMPLETED', async () => {
    intervention.start();
    intervention.complete();
    await repository.save(intervention);
    intervention.releaseEvents();

    await expect(completeService.execute(intervention.id)).rejects.toThrow(
      InterventionCannotBeCompletedException,
    );
  });
});
