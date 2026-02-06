import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';
import { CancelInterventionService } from '../../../src/interventions/application/CancelIntervention.service';
import {
  InterventionCannotBeCancelledException,
  InterventionNotFoundException,
} from '../../../src/interventions/domain/exceptions';
import { InMemoryInterventionRepository } from '../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('CancelInterventionService', () => {
  let repository: InMemoryInterventionRepository;
  let cancelService: CancelInterventionService;
  let intervention: Intervention;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    cancelService = new CancelInterventionService(repository);

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

  it('transitions intervention from PLANNED to CANCELLED and persists', async () => {
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await cancelService.execute(intervention.id);

    expect(updated.status).toBe(InterventionStatus.CANCELLED);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.status).toBe(InterventionStatus.CANCELLED);
  });

  it('transitions intervention from ONGOING to CANCELLED and persists', async () => {
    intervention.start();
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await cancelService.execute(intervention.id);

    expect(updated.status).toBe(InterventionStatus.CANCELLED);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.status).toBe(InterventionStatus.CANCELLED);
  });

  it('throws InterventionNotFoundException when intervention does not exist', async () => {
    const unknownId = Identifier.generate();

    await expect(cancelService.execute(unknownId)).rejects.toThrow(
      InterventionNotFoundException,
    );
  });

  it('throws InterventionCannotBeCancelledException when intervention is COMPLETED', async () => {
    intervention.start();
    intervention.complete();
    await repository.save(intervention);
    intervention.releaseEvents();

    await expect(cancelService.execute(intervention.id)).rejects.toThrow(
      InterventionCannotBeCancelledException,
    );
  });
});
