import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { ShieldAlert, Clock3, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listLaneInvites } from '@/lib/invites.functions';
import { hasPendingWatchman, needsWatchman, type ReminderPath } from '@/lib/watchman-reminder';

export function WatchmanReminder({ paths, onInvite }: { paths: ReminderPath[]; onInvite?: () => void }) {
  const listFn = useServerFn(listLaneInvites);
  const candidates = paths.filter(needsWatchman);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!candidates.length) return;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [candidates.length]);
  const queries = useQueries({ queries: candidates.map((path) => ({
    queryKey: ['invites', path.id],
    queryFn: () => listFn({ data: { laneId: path.id } }),
    refetchInterval: 30000,
  })) });
  if (!candidates.length) return null;
  if (queries.some((query) => query.isPending)) return null;
  const awaiting = candidates.filter((_, index) => hasPendingWatchman(queries[index]?.data ?? [], now));
  const missing = candidates.filter((_, index) => !hasPendingWatchman(queries[index]?.data ?? [], now));
  const target = missing[0] ?? awaiting[0];
  if (!target) return null;
  const pendingOnly = !missing.length;
  const uncertain = queries.some((query) => query.isError);
  const Icon = pendingOnly ? Clock3 : ShieldAlert;

  return (
    <section aria-label="Watchman reminder" className="kp-role-briefing mb-5 py-4">
      <div className="flex items-start gap-3">
        <Icon size={22} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="kp-briefing-title text-base text-parchment font-semibold">
            {pendingOnly ? 'Awaiting your Watchman.' : 'Do not walk unwatched.'}
          </h2>
          <p className="text-sm text-stone leading-relaxed mt-1">
            {pendingOnly
              ? 'Your invitation is pending. This Path remains unwatched until someone accepts.'
              : 'Your commitment deserves a witness. Add at least one Watchman—someone who knows your voice and will answer when you fall.'}
          </p>
          {paths.length > 1 && <p className="text-xs text-primary mt-2">
            {missing.length > 0 && `${missing.length} Path${missing.length === 1 ? '' : 's'} without ${uncertain ? 'a confirmed Watchman' : 'an invitation'}`}
            {missing.length > 0 && awaiting.length > 0 && ' · '}
            {awaiting.length > 0 && `${awaiting.length} awaiting acceptance`}
          </p>}
          <Button variant="pathEdit" size="sm" className="mt-3 max-w-full whitespace-normal text-left" asChild={!onInvite} onClick={onInvite}>
            {onInvite ? <span className="inline-flex items-center gap-2">{pendingOnly || uncertain ? 'View invitation' : 'Add a Watchman'}<ArrowDown size={16} /></span>
              : <Link to="/paths/$id" params={{ id: target.id }} search={{ newlyCreated: false }}>{pendingOnly || uncertain ? 'View invitation' : 'Add a Watchman'}<ArrowRight size={16} /></Link>}
          </Button>
        </div>
      </div>
    </section>
  );
}