import { beforeEach, describe, expect, it } from '@jest/globals';
import { UUID } from 'node:crypto';
import { InterventionType } from '../../../../src/interventions/domain/models/InterventionType';
import { Address } from '../../../../src/shared/domain/address';
import { Intervention } from '../../../../src/interventions/domain/models/intervention';
import { InterventionStatus } from '../../../../src/interventions/domain/models/InterventionStatus';
import { InterventionTeam } from '../../../../src/interventions/domain/models/InterventionTeam';
import {
  InterventionCannotAddTeamMemberException,
  InterventionCannotBeCancelledException,
  InterventionCannotBeCompletedException,
  InterventionCannotBeStartedException,
} from '../../../../src/interventions/domain/exceptions';
import {
  InterventionCancelled,
  InterventionCompleted,
  InterventionPlanned,
  InterventionStarted,
  TeamMemberAddedToIntervention,
} from '../../../../src/interventions/domain/events';
import { Identifier } from '../../../../src/shared/domain/identifier';

describe('Intervention Entity', () => {
  let validParams: {
    type: InterventionType;
    address: Address;
    clientID: UUID;
    billableClientID: UUID;
  };

  beforeEach(() => {
    validParams = {
      type: InterventionType.MAINTENANCE,
      address: Address.create({
        street: '123 Main St',
        city: 'Paris',
        zipCode: '75001',
        country: 'France',
      }),
      clientID: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' as UUID,
      billableClientID: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' as UUID,
    };
  });

  describe('create', () => {
    it('should create an intervention with PLANNED status', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention).toBeInstanceOf(Intervention);
      expect(intervention.status).toBe(InterventionStatus.PLANNED);
    });

    it('should create an intervention with provided type and address', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.type).toBe(InterventionType.MAINTENANCE);
      expect(intervention.address).toBe(validParams.address);
    });

    it('should create an intervention with provided client IDs', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.clientID.value).toBe(validParams.clientID);
      expect(intervention.billableClientID.value).toBe(
        validParams.billableClientID,
      );
    });

    it('should initialize optional fields as null or empty', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.quotationID).toBeNull();
      expect(intervention.interventionTeam).toBeInstanceOf(InterventionTeam);
      expect(intervention.interventionTeam.length).toBe(0);
      expect(intervention.interventionTeam.isEmpty()).toBe(true);
      expect(intervention.deletedAt).toBeNull();
    });
  });

  describe('start', () => {
    it('should change status from PLANNED to ONGOING', () => {
      const intervention = Intervention.create(validParams);

      intervention.start();

      expect(intervention.status).toBe(InterventionStatus.ONGOING);
    });

    it('should throw InterventionCannotBeStartedException when starting from non-PLANNED status', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();

      expect(() => intervention.start()).toThrow(
        InterventionCannotBeStartedException,
      );
    });
  });

  describe('complete', () => {
    it('should change status to COMPLETED when ONGOING', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();

      intervention.complete();

      expect(intervention.status).toBe(InterventionStatus.COMPLETED);
    });

    it('should throw InterventionCannotBeCompletedException when completing from PLANNED', () => {
      const intervention = Intervention.create(validParams);

      expect(() => intervention.complete()).toThrow(
        InterventionCannotBeCompletedException,
      );
    });

    it('should not change createdAt', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();
      const originalCreatedAt = intervention.createdAt;

      intervention.complete();

      expect(intervention.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED from PLANNED', () => {
      const intervention = Intervention.create(validParams);

      intervention.cancel();

      expect(intervention.status).toBe(InterventionStatus.CANCELLED);
    });

    it('should change status to CANCELLED from ONGOING', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();

      intervention.cancel();

      expect(intervention.status).toBe(InterventionStatus.CANCELLED);
    });

    it('should update the updatedAt timestamp', () => {
      const intervention = Intervention.create(validParams);
      const originalUpdatedAt = intervention.updatedAt;

      setTimeout(() => {
        intervention.cancel();

        expect(intervention.updatedAt.toMillis()).toBeGreaterThan(
          originalUpdatedAt.toMillis(),
        );
      }, 10);
    });

    it('should throw InterventionCannotBeCancelledException when cancelling from COMPLETED', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();
      intervention.complete();

      expect(() => intervention.cancel()).toThrow(
        InterventionCannotBeCancelledException,
      );
    });
  });

  describe('status transitions', () => {
    it('should allow PLANNED -> start -> ONGOING -> complete -> COMPLETED', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.status).toBe(InterventionStatus.PLANNED);

      intervention.start();
      expect(intervention.status).toBe(InterventionStatus.ONGOING);

      intervention.complete();
      expect(intervention.status).toBe(InterventionStatus.COMPLETED);
    });

    it('should allow PLANNED -> cancel -> CANCELLED', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.status).toBe(InterventionStatus.PLANNED);

      intervention.cancel();
      expect(intervention.status).toBe(InterventionStatus.CANCELLED);
    });
  });

  describe('Domain Events', () => {
    it('should record InterventionPlanned when created', () => {
      const intervention = Intervention.create(validParams);
      const events = intervention.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InterventionPlanned);
      const planned = events[0] as InterventionPlanned;
      expect(planned.interventionId.value).toBe(intervention.id.value);
      expect(planned.clientId.value).toBe(validParams.clientID);
      expect(planned.billableClientId.value).toBe(validParams.billableClientID);
      expect(planned.type).toBe(InterventionType.MAINTENANCE);
    });

    it('should record InterventionStarted when start() is called', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();

      intervention.start();
      const events = intervention.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InterventionStarted);
      expect((events[0] as InterventionStarted).interventionId.value).toBe(
        intervention.id.value,
      );
    });

    it('should record InterventionCompleted when complete() is called', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();
      intervention.start();
      intervention.releaseEvents();

      intervention.complete();
      const events = intervention.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InterventionCompleted);
    });

    it('should record InterventionCancelled when cancel() is called', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();

      intervention.cancel();
      const events = intervention.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InterventionCancelled);
    });

    it('should clear events after releaseEvents()', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();

      intervention.start();
      expect(intervention.releaseEvents()).toHaveLength(1);
      expect(intervention.releaseEvents()).toHaveLength(0);
    });
  });

  describe('addTeamMember', () => {
    it('should add a team member when status is PLANNED', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();
      const plumberId = Identifier.generate();

      intervention.addTeamMember(plumberId);

      expect(intervention.interventionTeam.length).toBe(1);
      expect(intervention.interventionTeam.memberIds[0].value).toBe(
        plumberId.value,
      );
    });

    it('should add a team member when status is ONGOING', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();
      intervention.start();
      intervention.releaseEvents();
      const plumberId = Identifier.generate();

      intervention.addTeamMember(plumberId);

      expect(intervention.interventionTeam.length).toBe(1);
    });

    it('should record TeamMemberAddedToIntervention when adding a member', () => {
      const intervention = Intervention.create(validParams);
      intervention.releaseEvents();
      const plumberId = Identifier.generate();

      intervention.addTeamMember(plumberId);
      const events = intervention.releaseEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TeamMemberAddedToIntervention);
      const added = events[0] as TeamMemberAddedToIntervention;
      expect(added.interventionId.value).toBe(intervention.id.value);
      expect(added.memberId.value).toBe(plumberId.value);
    });

    it('should throw InterventionCannotAddTeamMemberException when status is COMPLETED', () => {
      const intervention = Intervention.create(validParams);
      intervention.start();
      intervention.complete();
      const plumberId = Identifier.generate();

      expect(() => intervention.addTeamMember(plumberId)).toThrow(
        InterventionCannotAddTeamMemberException,
      );
    });

    it('should throw InterventionCannotAddTeamMemberException when status is CANCELLED', () => {
      const intervention = Intervention.create(validParams);
      intervention.cancel();
      const plumberId = Identifier.generate();

      expect(() => intervention.addTeamMember(plumberId)).toThrow(
        InterventionCannotAddTeamMemberException,
      );
    });
  });
});
