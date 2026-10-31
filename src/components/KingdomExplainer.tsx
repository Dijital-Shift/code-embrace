import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

type KingdomExplainerProps = { mp4: string; webm: string; poster: string };

export function KingdomExplainer({ mp4, webm, poster }: KingdomExplainerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [started, setStarted] = useState(false);
  const { user } = useAuth();

  async function playFilm() {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    try {
      await video.play();
    } catch {
      setStarted(false);
      if (video.error) setFailed(true);
    }
  }

  function retry() {
    setFailed(false);
    setStarted(false);
    videoRef.current?.load();
  }

  return (
    <section aria-labelledby="kingdom-film-title" className="border-y border-border bg-background px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h2 id="kingdom-film-title" className="kp-film-title text-lg font-semibold sm:text-2xl">Watch Kingdom Protocol in action.</h2>
          <div className="kp-film-rule mx-auto mt-3" aria-hidden="true" />
        </div>
        <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-background">
          <video
            ref={videoRef}
            aria-label="Kingdom Protocol — accountability with a living Watchman"
            className="block h-full w-full object-contain"
            controls={started}
            playsInline
            preload="metadata"
            poster={poster}
            onPlay={() => setStarted(true)}
            onLoadedMetadata={() => setFailed(false)}
            onError={() => setFailed(true)}
          >
            <source src={mp4} type={'video/mp4; codecs="avc1.640028, mp4a.40.2"'} />
            <source src={webm} type="video/webm" />
          </video>
          {!started && !failed && (
            <Button
              variant="outline"
              onClick={playFilm}
              aria-label="Play film"
              className="absolute left-3 top-3 z-10 min-h-11 border-primary/60 bg-background/90 text-primary hover:bg-background hover:text-primary sm:left-5 sm:top-5"
            >
              <Play aria-hidden="true" />
              <span className="font-heading text-xs uppercase">Play film</span>
            </Button>
          )}
          {failed && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
              <p>The film couldn’t load.</p>
              <Button variant="outline" onClick={retry}><RotateCcw aria-hidden="true" />Try again</Button>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="default" size="lg" className="h-auto min-h-11 whitespace-normal text-center">
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? "Open Kingdom Protocol" : "Begin the 30-day watch"}<ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}