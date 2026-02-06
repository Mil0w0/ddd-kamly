import { beforeEach, describe, expect, it } from '@jest/globals';
import { UUID } from 'node:crypto';
import { InterventionType } from '../../../../src/interventions/domain/models/InterventionType';
import { InterventionTeam } from '../../../../src/interventions/domain/models/InterventionTeam';
import { Address } from '../../../../src/shared/domain/address';
import { Intervention } from '../../../../src/interventions/domain/models/intervention';
import { InterventionStatus } from '../../../../src/interventions/domain/models/InterventionStatus';
import { InterventionCannotBeStartedException } from '../../../../src/interventions/domain/exceptions/InterventionCannotBeStartedException';

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
});
