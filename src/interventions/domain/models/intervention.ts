import { DateTime } from 'luxon';
import { InterventionStatus } from './InterventionStatus';
import { InterventionType } from './InterventionType';
import { InterventionTeam } from './InterventionTeam';
import { Address } from '../../../shared/domain/address';
import { Identifier } from '../../../shared/domain/identifier';
import { UUID } from 'node:crypto';

const ALLOWED_COMPLETE_FROM: InterventionStatus[] = [
  InterventionStatus.ONGOING,
];
const ALLOWED_CANCEL_FROM: InterventionStatus[] = [
  InterventionStatus.PLANNED,
  InterventionStatus.ONGOING,
];
const ALLOWED_START_FROM: InterventionStatus[] = [InterventionStatus.PLANNED];

export class Intervention {
  private constructor(
    private readonly _id: Identifier,
    private _status: InterventionStatus,
    private _type: InterventionType,
    private _address: Address,
    private _clientID: Identifier,
    private _billableClientID: Identifier,
    private _quotationID: Identifier | null,
    private _interventionTeam: InterventionTeam,
    private readonly _createdAt: DateTime,
    private _updatedAt: DateTime,
    private _deletedAt: DateTime | null,
  ) {}

  static create(params: {
    type: InterventionType;
    address: Address;
    clientID: Identifier | UUID;
    billableClientID: Identifier | UUID;
  }): Intervention {
    const now = DateTime.now();
    const clientID =
      params.clientID instanceof Identifier
        ? params.clientID
        : Identifier.create(params.clientID);
    const billableClientID =
      params.billableClientID instanceof Identifier
        ? params.billableClientID
        : Identifier.create(params.billableClientID);

    return new Intervention(
      Identifier.generate(),
      InterventionStatus.PLANNED,
      params.type,
      params.address,
      clientID,
      billableClientID,
      null,
      InterventionTeam.empty(),
      now,
      now,
      null,
    );
  }

  start(): void {
    this.assertTransition(InterventionStatus.ONGOING, ALLOWED_START_FROM);
    this.updateStatus(InterventionStatus.ONGOING);
  }

  complete(): void {
    this.assertTransition(InterventionStatus.COMPLETED, ALLOWED_COMPLETE_FROM);
    this.updateStatus(InterventionStatus.COMPLETED);
  }

  cancel(): void {
    this.assertTransition(InterventionStatus.CANCELLED, ALLOWED_CANCEL_FROM);
    this.updateStatus(InterventionStatus.CANCELLED);
  }

  private assertTransition(
    targetStatus: InterventionStatus,
    allowedFrom: InterventionStatus[],
  ): void {
    if (!allowedFrom.includes(this._status)) {
      throw new Error(
        `Cannot transition to ${targetStatus} from ${this._status}. Allowed from: ${allowedFrom.join(', ')}`,
      );
    }
  }

  private updateStatus(newStatus: InterventionStatus): void {
    this._status = newStatus;
    this._updatedAt = DateTime.now();
  }

  get id(): Identifier {
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

  get clientID(): Identifier {
    return this._clientID;
  }

  get billableClientID(): Identifier {
    return this._billableClientID;
  }

  get quotationID(): Identifier | null {
    return this._quotationID;
  }

  get interventionTeam(): InterventionTeam {
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
