import { Download, PlayCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppInstall } from '@/components/AppInstallProvider';
import { InstallGuideSheet } from '@/components/InstallWalkthrough';

export function AppInstallCard() {
  const { platform, installed, available, busy, error, install } = useAppInstall();
  if (installed || (platform !== 'android' && platform !== 'ios' && !available)) return null;
  const oneTap = platform !== 'ios' && (available || busy);
  return (
    <section aria-label="Install Kingdom Protocol" className="kp-role-briefing py-4 my-5 max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <Smartphone aria-hidden="true" className="text-primary shrink-0 mt-1" size={22} />
        <div className="min-w-0 flex-1">
          <h2 className="kp-briefing-title text-parchment text-base font-semibold">Kingdom Protocol on your phone</h2>
          {oneTap ? (
            <Button onClick={() => void install()} disabled={busy} className="mt-3 kp-briefing-accept"><Download aria-hidden="true" />{busy ? 'Installing…' : 'Install Kingdom Protocol'}</Button>
          ) : (
            <>
              <p className="text-sm text-stone mt-2">
                {platform === 'ios' ? 'Install from Safari so alerts reach you.' : 'Install from Chrome so alerts reach you.'}
              </p>
              {/* The guide shows the real taps; reading steps alone left people stuck. */}
              <InstallGuideSheet description="On iPhone, use Safari. On Android, use Chrome.">
                <Button className="mt-3 w-full min-h-12 h-auto font-semibold kp-briefing-accept">
                  <PlayCircle aria-hidden="true" /> Watch 10-second install guide
                </Button>
              </InstallGuideSheet>
            </>
          )}
          {error && <p role="alert" className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </div>
    </section>
  );
}
