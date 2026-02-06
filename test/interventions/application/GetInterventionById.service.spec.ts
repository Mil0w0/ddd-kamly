import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../src/shared/domain/identifier';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';
import { GetInterventionByIdService } from '../../../src/interventions/application/GetInterventionById.service';
import { InterventionNotFoundException } from '../../../src/interventions/domain/exceptions';
import { InMemoryInterventionRepository } from '../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('GetInterventionByIdService', () => {
  let repository: InMemoryInterventionRepository;
  let getByIdService: GetInterventionByIdService;
  let intervention: Intervention;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    getByIdService = new GetInterventionByIdService(repository);

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

  it('returns the intervention when it exists', async () => {
    await repository.save(intervention);

    const result = await getByIdService.execute(intervention.id);

    expect(result).not.toBeNull();
    expect(result.id.value).toBe(intervention.id.value);
    expect(result.status).toBe(InterventionStatus.PLANNED);
    expect(result.type).toBe(InterventionType.MAINTENANCE);
  });

  it('throws InterventionNotFoundException when intervention does not exist', async () => {
    const unknownId = Identifier.generate();

    await expect(getByIdService.execute(unknownId)).rejects.toThrow(
      InterventionNotFoundException,
    );
  });
});
