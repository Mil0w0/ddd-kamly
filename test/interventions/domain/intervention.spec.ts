import { describe, it, expect, beforeEach } from '@jest/globals';
import { UUID } from 'node:crypto';
import { InterventionType } from '../../../src/interventions/domain/models/InterventionType';
import { Address } from '../../../src/shared/domain/address';
import { Intervention } from '../../../src/interventions/domain/models/intervention';
import { InterventionStatus } from '../../../src/interventions/domain/models/InterventionStatus';

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

      expect(intervention.clientID).toBe(validParams.clientID);
      expect(intervention.billableClientID).toBe(validParams.billableClientID);
    });

    it('should initialize optional fields as null or empty', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.quotationID).toBeNull();
      expect(intervention.interventionTeam).toEqual([]);
      expect(intervention.interventionTeam.length).toBe(0);
      expect(intervention.deletedAt).toBeNull();
    });
  });

  describe('complete', () => {
    it('should change status to COMPLETED', () => {
      const intervention = Intervention.create(validParams);

      intervention.complete();

      expect(intervention.status).toBe(InterventionStatus.COMPLETED);
    });

    it('should not change createdAt', () => {
      const intervention = Intervention.create(validParams);
      const originalCreatedAt = intervention.createdAt;

      intervention.complete();

      expect(intervention.createdAt).toBe(originalCreatedAt);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED', () => {
      const intervention = Intervention.create(validParams);

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

    it('should be possible to cancel from any status', () => {
      const intervention = Intervention.create(validParams);

      // From PLANNED
      expect(intervention.status).toBe(InterventionStatus.PLANNED);
      intervention.cancel();
      expect(intervention.status).toBe(InterventionStatus.CANCELLED);

      // From COMPLETED
      const intervention2 = Intervention.create(validParams);
      intervention2.complete();
      expect(intervention2.status).toBe(InterventionStatus.COMPLETED);
      intervention2.cancel();
      expect(intervention2.status).toBe(InterventionStatus.CANCELLED);
    });
  });

  describe('status transitions', () => {
    it('should allow PLANNED COMPLETED and CANCELLED transitions', () => {
      const intervention = Intervention.create(validParams);

      expect(intervention.status).toBe(InterventionStatus.PLANNED);

      intervention.complete();
      expect(intervention.status).toBe(InterventionStatus.COMPLETED);

      intervention.cancel();
      expect(intervention.status).toBe(InterventionStatus.CANCELLED);
    });
  });
});
