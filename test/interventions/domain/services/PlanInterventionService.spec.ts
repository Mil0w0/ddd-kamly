import { beforeEach, describe, expect, it } from '@jest/globals';
import { Identifier } from '../../../../src/shared/domain/identifier';
import { Address } from '../../../../src/shared/domain/address';
import { Intervention } from '../../../../src/interventions/domain/models/intervention';
import { InterventionStatus } from '../../../../src/interventions/domain/models/InterventionStatus';
import { InterventionTeam } from '../../../../src/interventions/domain/models/InterventionTeam';
import { InterventionType } from '../../../../src/interventions/domain/models/InterventionType';
import { CheckTeamAvailabilityService } from '../../../../src/interventions/domain/services/CheckTeamAvailabilityService';
import { PlanInterventionService } from '../../../../src/interventions/domain/services/PlanInterventionService';
import { TeamNotAvailableException } from '../../../../src/interventions/domain/exceptions/TeamNotAvailableException';
import { InMemoryInterventionRepository } from '../../../../src/interventions/infrastructure/repositories/InMemoryInterventionRepository';

describe('PlanInterventionService (Domain Service)', () => {
  let repository: InMemoryInterventionRepository;
  let checkTeamAvailability: CheckTeamAvailabilityService;
  let planIntervention: PlanInterventionService;
  let clientId: Identifier;
  let billableClientId: Identifier;
  let teamMemberIds: Identifier[];
  let address: Address;

  beforeEach(() => {
    repository = new InMemoryInterventionRepository();
    checkTeamAvailability = new CheckTeamAvailabilityService(repository);
    planIntervention = new PlanInterventionService(
      repository,
      checkTeamAvailability,
    );
    clientId = Identifier.generate();
    billableClientId = Identifier.generate();
    teamMemberIds = [Identifier.generate(), Identifier.generate()];
    address = Address.create({
      street: '5 Avenue Plan',
      city: 'Paris',
      zipCode: '75002',
      country: 'France',
    });
  });

  it('creates and persists an intervention when team is available', async () => {
    const command = {
      type: InterventionType.INSTALLATION,
      address,
      clientID: clientId,
      billableClientID: billableClientId,
      teamMemberIds,
    };

    const intervention = await planIntervention.execute(command);

    expect(intervention).toBeInstanceOf(Intervention);
    expect(intervention.status).toBe(InterventionStatus.PLANNED);
    expect(intervention.type).toBe(InterventionType.INSTALLATION);
    expect(intervention.interventionTeam.length).toBe(2);

    const loaded = await repository.findById(intervention.id);
    expect(loaded).not.toBeNull();
    expect(loaded?.id.value).toBe(intervention.id.value);
  });

  it('throws TeamNotAvailableException when team has ongoing intervention', async () => {
    const busyTeam = InterventionTeam.create(teamMemberIds);
    const ongoing = Intervention.create({
      type: InterventionType.MAINTENANCE,
      address,
      clientID: clientId,
      billableClientID: billableClientId,
      team: busyTeam,
    });
    ongoing.start();
    await repository.save(ongoing);

    const command = {
      type: InterventionType.INSTALLATION,
      address,
      clientID: Identifier.generate(),
      billableClientID: Identifier.generate(),
      teamMemberIds,
    };

    await expect(planIntervention.execute(command)).rejects.toThrow(
      TeamNotAvailableException,
    );
  });

  it('creates intervention with empty team when teamMemberIds is empty', async () => {
    const command = {
      type: InterventionType.MAINTENANCE,
      address,
      clientID: clientId,
      billableClientID: billableClientId,
      teamMemberIds: [],
    };

    const intervention = await planIntervention.execute(command);

    expect(intervention.interventionTeam.isEmpty()).toBe(true);
  });
});
