import { DateTime } from 'luxon';
import { InterventionStatus } from './InterventionStatus';
import { InterventionType } from './InterventionType';
import { Address } from '../../../shared/domain/address';
import { UUID } from 'node:crypto';
import { v7 as uuidv7 } from 'uuid';

/*
 * Agregate
 */
export class Intervention {
  //TODO: for all UUID introduce a custom type Identifiyer that inherits from UUID

  private constructor(
    private readonly _id: UUID,
    private _status: InterventionStatus,
    private _type: InterventionType,
    private _address: Address,
    private _clientID: UUID,
    private _billableClientID: UUID,
    private _quotationID: UUID | null,
    private _interventionTeam: UUID[], //Several plumbers can be booked on one intervention. TODO: Transform this into its own value object
    private readonly _createdAt: DateTime,
    private _updatedAt: DateTime,
    private _deletedAt: DateTime | null,
  ) {}

  static create(params: {
    type: InterventionType;
    address: Address;
    clientID: UUID;
    billableClientID: UUID;
  }): Intervention {
    const now = DateTime.now();
    return new Intervention(
      uuidv7() as UUID,
      InterventionStatus.PLANNED,
      params.type,
      params.address,
      params.clientID,
      params.billableClientID,
      null,
      [],
      now,
      now,
      null,
    );
  }

  //todo: so do we check the status workflow in the following status updates functions.
  complete(): void {
    this.updateStatus(InterventionStatus.COMPLETED);
  }

  cancel(): void {
    this.updateStatus(InterventionStatus.CANCELLED);
  }

  //PRIVATE METHODS :

  private updateStatus(newStatus: InterventionStatus): void {
    this._status = newStatus;
    this._updatedAt = DateTime.now();
  }

  // GETTERS

  get id(): UUID {
    return this._id;
  }

  get status(): InterventionStatus {
    return this._status;
  }

  get type(): InterventionType {
    return this._type;
  }

  get address(): Address {
    return this._address;
  }

  get clientID(): UUID {
    return this._clientID;
  }

  get billableClientID(): UUID {
    return this._billableClientID;
  }

  get quotationID(): UUID | null {
    return this._quotationID;
  }

  get interventionTeam(): UUID[] {
    return this._interventionTeam;
  }

  get createdAt(): DateTime {
    return this._createdAt;
  }

  get updatedAt(): DateTime {
    return this._updatedAt;
  }

  get deletedAt(): DateTime | null {
    return this._deletedAt;
  }
}
