import type { TeamMemberAddedToIntervention } from '../../domain/events';

export function onTeamMemberAddedToIntervention(
  event: TeamMemberAddedToIntervention,
): void {
  // Example: notify plumber, update planning view, etc.
  console.log(
    `[TeamMemberAddedToIntervention] interventionId=${event.interventionId.toString()} memberId=${event.memberId.toString()}`,
  );
}
