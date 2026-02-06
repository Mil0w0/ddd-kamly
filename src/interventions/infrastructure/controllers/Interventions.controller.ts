import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import type { UUID } from 'node:crypto';
import { Identifier } from '../../../shared/domain/identifier';
import { Address } from '../../../shared/domain/address';
import { InterventionType } from '../../domain/models/InterventionType';
import { PlanInterventionService } from '../../domain/services';
import { GetInterventionByIdService } from '../../application/GetInterventionById.service';
import { StartInterventionService } from '../../application/StartIntervention.service';
import { CompleteInterventionService } from '../../application/CompleteIntervention.service';
import { CancelInterventionService } from '../../application/CancelIntervention.service';
import { AddPlumberToInterventionService } from '../../application/AddPlumberToIntervention.service';
import type { Intervention } from '../../domain/models/intervention';

const addressDto = (address: {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  additionalInformation?: string;
}) => ({
  street: address.street,
  city: address.city,
  zipCode: address.zipCode,
  country: address.country,
  ...(address.additionalInformation != null && {
    additionalInformation: address.additionalInformation,
  }),
});

function interventionToResponse(intervention: Intervention) {
  return {
    id: intervention.id.value,
    status: intervention.status,
    type: intervention.type,
    address: {
      street: intervention.address.street,
      city: intervention.address.city,
      zipCode: intervention.address.zipCode,
      country: intervention.address.country,
      additionalInformation: intervention.address.additionalInformation,
    },
    clientID: intervention.clientID.value,
    billableClientID: intervention.billableClientID.value,
    quotationID: intervention.quotationID?.value ?? null,
    teamMemberIds: intervention.interventionTeam.memberIds.map(
      (id) => id.value,
    ),
    createdAt: intervention.createdAt.toISO(),
    updatedAt: intervention.updatedAt.toISO(),
    deletedAt: intervention.deletedAt?.toISO() ?? null,
  };
}

@Controller('interventions')
export class InterventionsController {
  constructor(
    private readonly planInterventionService: PlanInterventionService,
    private readonly getInterventionByIdService: GetInterventionByIdService,
    private readonly startInterventionService: StartInterventionService,
    private readonly completeInterventionService: CompleteInterventionService,
    private readonly cancelInterventionService: CancelInterventionService,
    private readonly addPlumberToInterventionService: AddPlumberToInterventionService,
  ) {}

  @Post()
  async plan(
    @Body()
    body: {
      type: keyof typeof InterventionType;
      address: {
        street: string;
        city: string;
        zipCode: string;
        country: string;
        additionalInformation?: string;
      };
      clientID: string;
      billableClientID: string;
      teamMemberIds?: string[];
    },
  ) {
    const address = Address.create(addressDto(body.address));
    const clientID = Identifier.create(body.clientID as UUID);
    const billableClientID = Identifier.create(body.billableClientID as UUID);
    const teamMemberIds = (body.teamMemberIds ?? []).map((id) =>
      Identifier.create(id as UUID),
    );

    const type =
      body.type in InterventionType
        ? InterventionType[body.type]
        : InterventionType.MAINTENANCE;

    const intervention = await this.planInterventionService.execute({
      type,
      address,
      clientID,
      billableClientID,
      teamMemberIds,
    });
    return interventionToResponse(intervention);
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const intervention = await this.getInterventionByIdService.execute(
      Identifier.create(id as UUID),
    );
    return interventionToResponse(intervention);
  }

  @Post(':id/start')
  async start(@Param('id', ParseUUIDPipe) id: string) {
    const intervention = await this.startInterventionService.execute(
      Identifier.create(id as UUID),
    );
    return interventionToResponse(intervention);
  }

  @Post(':id/complete')
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    const intervention = await this.completeInterventionService.execute(
      Identifier.create(id as UUID),
    );
    return interventionToResponse(intervention);
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const intervention = await this.cancelInterventionService.execute(
      Identifier.create(id as UUID),
    );
    return interventionToResponse(intervention);
  }

  @Post(':id/team-members')
  async addTeamMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { plumberId: string },
  ) {
    const intervention = await this.addPlumberToInterventionService.execute({
      interventionId: Identifier.create(id as UUID),
      plumberId: Identifier.create(body.plumberId as UUID),
    });
    return interventionToResponse(intervention);
  }
}
