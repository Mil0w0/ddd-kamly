import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';
import { AddPlumberToInterventionService } from '../../../src/interventions/application/AddPlumberToIntervention.service';
import { InterventionNotFoundException } from '../../../src/interventions/domain/exceptions/InterventionNotFoundException';
import { InMemoryInterventionRepository } from '../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('AddPlumberToInterventionService', () => {
  let repository: InMemoryInterventionRepository;
  let addPlumberService: AddPlumberToInterventionService;
  let intervention: Intervention;
  let plumberId: Identifier;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    addPlumberService = new AddPlumberToInterventionService(repository);

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
    plumberId = Identifier.generate();
  });

  it('adds a plumber to an existing intervention and persists', async () => {
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await addPlumberService.execute({
      interventionId: intervention.id,
      plumberId,
    });

    expect(updated.interventionTeam.length).toBe(1);
    expect(updated.interventionTeam.memberIds[0].value).toBe(plumberId.value);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.interventionTeam.length).toBe(1);
    expect(loaded?.interventionTeam.memberIds[0].value).toBe(plumberId.value);
  });

  it('throws InterventionNotFoundException when intervention does not exist', async () => {
    const unknownId = Identifier.generate();

    await expect(
      addPlumberService.execute({
        interventionId: unknownId,
        plumberId,
      }),
    ).rejects.toThrow(InterventionNotFoundException);
  });

  it('allows adding a plumber when intervention is ONGOING', async () => {
    intervention.start();
    await repository.save(intervention);
    intervention.releaseEvents();

    const updated = await addPlumberService.execute({
      interventionId: intervention.id,
      plumberId,
    });

    expect(updated.status).toBe(InterventionStatus.ONGOING);
    expect(updated.interventionTeam.length).toBe(1);
  });
});
