import type { ClientCreated } from '../../domain/events';

export async function onClientCreated(event: ClientCreated): Promise<void> {
  console.log(
    `[ClientCreated] clientId=${event.clientId.toString()} name=${event.name} email=${event.email}`,
  );
}
