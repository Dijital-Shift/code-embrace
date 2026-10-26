import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppInstall } from '@/components/AppInstallProvider';

export function AppInstallCard() {
  const { platform, installed, available, busy, error, install } = useAppInstall();
  if (installed || (platform !== 'android' && platform !== 'ios' && !available)) return null;
  return (
    <section aria-label="Install Kingdom Protocol" className="kp-role-briefing py-4 my-5 max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <Smartphone aria-hidden="true" className="text-primary shrink-0 mt-1" size={22} />
        <div className="min-w-0 flex-1">
          <h2 className="kp-briefing-title text-parchment text-base font-semibold">Kingdom Protocol on your phone</h2>
          {platform === 'ios' ? (
            <p className="text-sm text-stone mt-2">In Safari, tap Share → Add to Home Screen, then open Kingdom Protocol from its icon.</p>
          ) : available || busy ? (
            <Button onClick={() => void install()} disabled={busy} className="mt-3 kp-briefing-accept"><Download aria-hidden="true" />{busy ? 'Installing…' : 'Install Kingdom Protocol'}</Button>
          ) : (
            <p className="text-sm text-stone mt-2">In Chrome, tap ⋮ → Install app or Add to Home screen.</p>
          )}
          {error && <p role="alert" className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </div>
    </section>
  );
}