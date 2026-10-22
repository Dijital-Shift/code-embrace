import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

type KingdomExplainerProps = { mp4: string; webm: string; poster: string };

export function KingdomExplainer({ mp4, webm, poster }: KingdomExplainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [ended, setEnded] = useState(false);
  const { user } = useAuth();

  function retry() {
    setFailed(false);
    setEnded(false);
    videoRef.current?.load();
  }

  return (
    <section aria-labelledby="kingdom-film-title" className="border-y border-border bg-background px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Executive dispatch · 45 seconds</p>
          <h2 id="kingdom-film-title" className="text-2xl font-semibold text-primary sm:text-3xl">See how the living Watchman breaks the silence.</h2>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-background">
          <video
            ref={videoRef}
            aria-label="Kingdom Protocol — accountability with a living Watchman"
            className="block h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            onEnded={() => setEnded(true)}
            onPlay={() => setEnded(false)}
            onLoadedMetadata={() => setFailed(false)}
            onError={() => setFailed(true)}
          >
            <source src={mp4} type={'video/mp4; codecs="avc1.640028, mp4a.40.2"'} />
            <source src={webm} type="video/webm" />
          </video>
          {failed && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
              <p>The film couldn’t load.</p>
              <Button variant="outline" onClick={retry}><RotateCcw aria-hidden="true" />Try again</Button>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <Button asChild variant={ended ? "default" : "outline"} size="lg" className="h-auto min-h-11 whitespace-normal text-center">
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? "Open Kingdom Protocol" : "Begin the 30-day watch"}<ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}