import type { InterventionPlanned } from '../../domain/events/InterventionPlanned';

export function onInterventionPlanned(event: InterventionPlanned): void {
  console.debug('[InterventionPlanned]', {
    interventionId: event.interventionId.value,
    clientId: event.clientId.value,
    type: event.type,
    occurredOn: event.occurredOn.toISO(),
  });
}
