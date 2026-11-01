import { createFileRoute } from '@tanstack/react-router';
import { AssignmentCard, AlertGroup } from './partner';

export const Route = createFileRoute('/verify-watch')({ component: VerifyWatch });
function VerifyWatch() {
  return <main className="max-w-lg mx-auto p-5">
    <AssignmentCard lane={{ lane_id: 'fixture', title: 'Daily Scripture', owner: { first_name: 'Test', phone: '+15555550100' } }} checkin={{ status: 'breached', breach_explanation: 'I let distractions take priority today. I need to return to the commitment I made.' }} statusColor={{ breached: 'var(--color-destructive)' }} defaultOpen sendFn={async () => ({})} onSent={() => {}} />
    <div className="h-[900px]" />
    <AlertGroup group={{ key: 'fixture', title: 'Daily Scripture', who: 'Test', silent: 1, breach: 2, last: '2026-10-31T18:00:00Z', items: [
      { notification_id: 'a', type: 'breach_report', sent_at: '2026-10-31T18:00:00Z', message_content: null, lane_id: 'fixture' },
      { notification_id: 'b', type: 'missed_checkin', sent_at: '2026-10-27T18:00:00Z', message_content: null, lane_id: 'fixture' },
      { notification_id: 'c', type: 'breach_report', sent_at: '2026-10-23T18:00:00Z', message_content: null, lane_id: 'fixture' },
    ] }} />
    <div className="h-[900px]" />
  </main>;
}