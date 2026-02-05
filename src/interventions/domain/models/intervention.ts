import { DateTime } from 'luxon';
import { InterventionStatus } from './InterventionStatus';
import { InterventionType } from './InterventionType';
import { Address } from '../../../commons/address/address';
import { UUID } from 'node:crypto';

class Intervention {
  interventionId: UUID; //TODO: for all UUID introduce a custom type Identifiyer that inherits from UUID

  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime;

  status: InterventionStatus;
  type: InterventionType;
  address: Address;
  clientID: UUID;
  billableClientID: UUID;
  quotationID: UUID;
  interventionTeam: UUID[]; //Several plumbers can be booked on one intervention. TODO: Transform this into its own value object

}

export default Intervention;
