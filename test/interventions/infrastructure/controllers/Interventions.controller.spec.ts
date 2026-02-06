import { Test, TestingModule } from '@nestjs/testing';
import { Identifier } from '../../../../src/shared/domain/identifier';
import { Address } from '../../../../src/shared/domain/address';
import { Intervention } from '../../../../src/interventions/domain/models/intervention';
import { InterventionType } from '../../../../src/interventions/domain/models/InterventionType';
import { InterventionStatus } from '../../../../src/interventions/domain/models/InterventionStatus';
import { PlanInterventionService } from '../../../../src/interventions/domain/services';
import { GetInterventionByIdService } from '../../../../src/interventions/application/GetInterventionById.service';
import { StartInterventionService } from '../../../../src/interventions/application/StartIntervention.service';
import { CompleteInterventionService } from '../../../../src/interventions/application/CompleteIntervention.service';
import { CancelInterventionService } from '../../../../src/interventions/application/CancelIntervention.service';
import { AddPlumberToInterventionService } from '../../../../src/interventions/application/AddPlumberToIntervention.service';
import { InterventionsController } from '../../../../src/interventions/infrastructure/controllers/Interventions.controller';

type PlanBody = Parameters<InterventionsController['plan']>[0];
type InterventionResponse = Awaited<
  ReturnType<InterventionsController['plan']>
>;
type PlanExecuteArgs = Parameters<PlanInterventionService['execute']>;
type AddPlumberCommand = Parameters<
  AddPlumberToInterventionService['execute']
>[0];

describe('InterventionsController', () => {
  let controller: InterventionsController;
  let planExecuteMock: jest.Mock<Promise<Intervention>, PlanExecuteArgs>;
  let getByIdExecuteMock: jest.Mock<Promise<Intervention>, [Identifier]>;
  let startExecuteMock: jest.Mock<Promise<Intervention>, [Identifier]>;
  let completeExecuteMock: jest.Mock<Promise<Intervention>, [Identifier]>;
  let cancelExecuteMock: jest.Mock<Promise<Intervention>, [Identifier]>;
  let addPlumberExecuteMock: jest.Mock<
    Promise<Intervention>,
    [AddPlumberCommand]
  >;

  let sampleIntervention: Intervention;
  const clientId = Identifier.generate();
  const billableClientId = Identifier.generate();

  beforeEach(async () => {
    const address = Address.create({
      street: '10 Rue Test',
      city: 'Paris',
      zipCode: '75001',
      country: 'France',
    });
    sampleIntervention = Intervention.create({
      type: InterventionType.MAINTENANCE,
      address,
      clientID: clientId,
      billableClientID: billableClientId,
    });

    planExecuteMock = jest
      .fn<Promise<Intervention>, PlanExecuteArgs>()
      .mockResolvedValue(sampleIntervention);
    getByIdExecuteMock = jest
      .fn<Promise<Intervention>, [Identifier]>()
      .mockResolvedValue(sampleIntervention);
    startExecuteMock = jest
      .fn<Promise<Intervention>, [Identifier]>()
      .mockResolvedValue(sampleIntervention);
    completeExecuteMock = jest
      .fn<Promise<Intervention>, [Identifier]>()
      .mockResolvedValue(sampleIntervention);
    cancelExecuteMock = jest
      .fn<Promise<Intervention>, [Identifier]>()
      .mockResolvedValue(sampleIntervention);
    addPlumberExecuteMock = jest
      .fn<Promise<Intervention>, [AddPlumberCommand]>()
      .mockResolvedValue(sampleIntervention);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterventionsController],
      providers: [
        {
          provide: PlanInterventionService,
          useValue: { execute: planExecuteMock },
        },
        {
          provide: GetInterventionByIdService,
          useValue: { execute: getByIdExecuteMock },
        },
        {
          provide: StartInterventionService,
          useValue: { execute: startExecuteMock },
        },
        {
          provide: CompleteInterventionService,
          useValue: { execute: completeExecuteMock },
        },
        {
          provide: CancelInterventionService,
          useValue: { execute: cancelExecuteMock },
        },
        {
          provide: AddPlumberToInterventionService,
          useValue: { execute: addPlumberExecuteMock },
        },
      ],
    }).compile();

    controller = module.get<InterventionsController>(InterventionsController);
  });

  describe('plan', () => {
    it('calls PlanInterventionService and returns intervention response', async () => {
      const body: PlanBody = {
        type: 'MAINTENANCE',
        address: {
          street: '10 Rue Test',
          city: 'Paris',
          zipCode: '75001',
          country: 'France',
        },
        clientID: clientId.value,
        billableClientID: billableClientId.value,
      };

      const result: InterventionResponse = await controller.plan(body);

      expect(planExecuteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: InterventionType.MAINTENANCE,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          clientID: expect.any(Identifier),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          billableClientID: expect.any(Identifier),
          teamMemberIds: [],
        }),
      );
      expect(result.id).toBe(sampleIntervention.id.value);
      expect(result.status).toBe(InterventionStatus.PLANNED);
      expect(result.type).toBe(InterventionType.MAINTENANCE);
      expect(result.address.street).toBe('10 Rue Test');
      expect(result.clientID).toBe(clientId.value);
      expect(result.billableClientID).toBe(billableClientId.value);
      expect(result.teamMemberIds).toEqual([]);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.deletedAt).toBeNull();
    });

    it('passes teamMemberIds when provided', async () => {
      const plumberId = Identifier.generate();
      const body: PlanBody = {
        type: 'INSTALLATION',
        address: {
          street: '5 Ave',
          city: 'Lyon',
          zipCode: '69001',
          country: 'France',
        },
        clientID: clientId.value,
        billableClientID: billableClientId.value,
        teamMemberIds: [plumberId.value],
      };

      await controller.plan(body);

      expect(planExecuteMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: InterventionType.INSTALLATION,
          teamMemberIds: [expect.any(Identifier)],
        }),
      );
    });
  });

  describe('getById', () => {
    it('calls GetInterventionByIdService and returns intervention response', async () => {
      const id = sampleIntervention.id.value;

      const result: InterventionResponse = await controller.getById(id);

      expect(getByIdExecuteMock).toHaveBeenCalledWith(expect.any(Identifier));
      expect(result.id).toBe(id);
      expect(result.status).toBe(InterventionStatus.PLANNED);
    });
  });

  describe('start', () => {
    it('calls StartInterventionService with intervention id', async () => {
      const id = sampleIntervention.id.value;

      await controller.start(id);

      expect(startExecuteMock).toHaveBeenCalledWith(expect.any(Identifier));
    });
  });

  describe('complete', () => {
    it('calls CompleteInterventionService with intervention id', async () => {
      const id = sampleIntervention.id.value;

      await controller.complete(id);

      expect(completeExecuteMock).toHaveBeenCalledWith(expect.any(Identifier));
    });
  });

  describe('cancel', () => {
    it('calls CancelInterventionService with intervention id', async () => {
      const id = sampleIntervention.id.value;

      await controller.cancel(id);

      expect(cancelExecuteMock).toHaveBeenCalledWith(expect.any(Identifier));
    });
  });

  describe('addTeamMember', () => {
    it('calls AddPlumberToInterventionService with intervention id and plumber id', async () => {
      const id = sampleIntervention.id.value;
      const plumberId = Identifier.generate();

      await controller.addTeamMember(id, { plumberId: plumberId.value });

      expect(addPlumberExecuteMock).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        interventionId: expect.any(Identifier),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        plumberId: expect.any(Identifier),
      });
    });
  });
});
