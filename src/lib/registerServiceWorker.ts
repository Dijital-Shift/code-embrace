// Kingdom Protocol app-update controller.
//
// Owns service-worker registration, update detection, the silent background
// swap, and the nuclear refresh. The app — not the browser — decides when a
// new build takes over, so a user mid-check-in is never reloaded out from
// under their fingers.

const APP_SW_PATH = "/sw.js";
const RUNNING_BUILD_ID = typeof __APP_BUILD_ID__ === "string" ? __APP_BUILD_ID__ : "dev";

export const APP_UPDATE_AVAILABLE_EVENT = "kp:update-available";
export const APP_UPDATE_REEXPAND_EVENT = "kp:update-reexpand";
export const APP_UPDATE_BLOCKED_CHANGED_EVENT = "kp:update-blocked-changed";

const isPreviewOrDevHost = (hostname: string) =>
  hostname.startsWith("id-preview--") ||
  hostname.startsWith("preview--") ||
  hostname === "lovableproject.com" ||
  hostname.endsWith(".lovableproject.com") ||
  hostname === "lovableproject-dev.com" ||
  hostname.endsWith(".lovableproject-dev.com") ||
  hostname === "beta.lovable.dev" ||
  hostname.endsWith(".beta.lovable.dev");

const shouldRegisterAppServiceWorker = () => {
  if (typeof window === "undefined") return false;
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false;
  if (isPreviewOrDevHost(window.location.hostname)) return false;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return false;
  return "serviceWorker" in navigator;
};

const isAppRegistration = (registration: ServiceWorkerRegistration) => {
  const scriptUrl =
    registration.active?.scriptURL ||
    registration.waiting?.scriptURL ||
    registration.installing?.scriptURL ||
    "";
  if (scriptUrl) return new URL(scriptUrl).pathname === APP_SW_PATH;
  return new URL(registration.scope).origin === window.location.origin;
};

// Only ever delete caches this app owns. Cache Storage is origin-scoped.
const isAppCacheName = (name: string) =>
  /(^|-)precache-v\d+-|(^|-)workbox-|^kp-/.test(name);

const cleanupAppCaches = async () => {
  if (typeof window === "undefined" || !("caches" in window)) return;
  const names = await caches.keys();
  await Promise.allSettled(names.filter(isAppCacheName).map((n) => caches.delete(n)));
};

const unregisterAppServiceWorkers = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    registrations.filter(isAppRegistration).map((r) => r.unregister()),
  );
  await cleanupAppCaches();
};

let currentRegistration: ServiceWorkerRegistration | null = null;
let updateAvailable = false;
let userInitiatedUpdate = false;
let bootActivationInProgress = false;
let registered = false;

export const isAppUpdateAvailable = () => updateAvailable;

// -------- "user is busy" guard --------
// Automatic apply paths must never interrupt someone typing an honesty note
// or sitting in a confirmation dialog.
const blockReasons = new Set<string>();

export const isUpdateBlocked = () => {
  if (blockReasons.size > 0) return true;
  if (typeof document === "undefined") return false;
  try {
    const el = document.activeElement as HTMLElement | null;
    const tag = el?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el?.isContentEditable) return true;
    if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return true;
  } catch {
    /* ignore */
  }
  return false;
};

export const setUpdateBlocked = (reason: string, blocked: boolean) => {
  const before = blockReasons.size > 0;
  if (blocked) blockReasons.add(reason);
  else blockReasons.delete(reason);
  if (before !== blockReasons.size > 0 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(APP_UPDATE_BLOCKED_CHANGED_EVENT));
  }
};

// iOS suspends timers the instant a home-screen app is backgrounded, so the
// primary swap attempt fires synchronously on the hidden transition and this
// timer is only a fallback.
const HIDDEN_SETTLE_MS = 3000;
let hiddenApplyTimer: number | undefined;

const cancelPendingHiddenApply = () => {
  if (hiddenApplyTimer) {
    window.clearTimeout(hiddenApplyTimer);
    hiddenApplyTimer = undefined;
  }
};

const scheduleSilentApply = () => {
  if (typeof window === "undefined") return;
  if (!updateAvailable) return;
  if (document.visibilityState !== "hidden") return;
  cancelPendingHiddenApply();
  applyAppUpdate({ silent: true });
  hiddenApplyTimer = window.setTimeout(() => {
    hiddenApplyTimer = undefined;
    if (document.visibilityState !== "hidden") return;
    applyAppUpdate({ silent: true });
  }, HIDDEN_SETTLE_MS);
};

const emitUpdateAvailable = () => {
  if (typeof window === "undefined") return;
  updateAvailable = true;
  window.dispatchEvent(new CustomEvent(APP_UPDATE_AVAILABLE_EVENT));
  try {
    scheduleSilentApply();
  } catch {
    /* ignore */
  }
};

const watchRegistrationForWaitingWorker = (registration: ServiceWorkerRegistration) => {
  if (registration.waiting) {
    emitUpdateAvailable();
    return;
  }
  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        emitUpdateAvailable();
      }
    });
  });
};

const activateWaitingUpdateAtBoot = (registration: ServiceWorkerRegistration) => {
  if (typeof window === "undefined") return false;
  if (bootActivationInProgress) return false;
  if (!registration.waiting) return false;
  bootActivationInProgress = true;
  updateAvailable = true;
  try {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  } catch {
    bootActivationInProgress = false;
    return false;
  }
  // A stuck worker would otherwise strand the user on the old build.
  window.setTimeout(() => {
    if (!bootActivationInProgress) return;
    bootActivationInProgress = false;
    if (currentRegistration?.waiting) void forceAppRefresh();
  }, 5000);
  return true;
};

export const applyAppUpdate = (opts?: { silent?: boolean }) => {
  const silent = opts?.silent === true;
  const waiting = currentRegistration?.waiting;

  // No waiting worker means no controllerchange will ever fire, so the pill
  // would spin forever. A visible tap falls back to the nuclear refresh.
  if (!waiting) {
    if (!silent) void forceAppRefresh();
    return;
  }

  userInitiatedUpdate = true;
  try {
    waiting.postMessage({ type: "SKIP_WAITING" });
  } catch {
    if (!silent) void forceAppRefresh();
    return;
  }

  if (!silent) {
    window.setTimeout(() => {
      if (!document.hidden && !isUpdateBlocked()) void forceAppRefresh();
    }, 4000);
  }
};

async function readServedBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/api/public/build-id?_cb=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { buildId?: string };
    return json?.buildId ?? null;
  } catch {
    return null;
  }
}

/**
 * Check for a new build. Never reloads a visible tab: it surfaces the pill and
 * lets the user tap it, or applies silently once the app is backgrounded.
 */
export const checkForAppUpdate = async (
  mode: "auto" | "manual" = "auto",
): Promise<"updating" | "stale" | "current" | "unavailable"> => {
  void mode;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return "unavailable";
  const reg = currentRegistration ?? (await navigator.serviceWorker.getRegistration());
  if (reg) {
    currentRegistration = reg;
    try {
      await reg.update();
    } catch {
      /* still fall through to the build-id check */
    }
    if (reg.waiting) {
      emitUpdateAvailable();
      return "updating";
    }
  }

  const servedBuildId = await readServedBuildId();
  if (!servedBuildId) return reg ? "current" : "unavailable";
  if (servedBuildId !== RUNNING_BUILD_ID) {
    emitUpdateAvailable();
    return "stale";
  }
  return "current";
};

/**
 * Nuclear refresh: unregister app workers, clear app caches, cache-bust reload.
 */
export const forceAppRefresh = async () => {
  try {
    await unregisterAppServiceWorkers();
  } catch {
    /* ignore */
  }
  try {
    await cleanupAppCaches();
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("_r", String(Date.now()));
  window.location.replace(url.toString());
};

export const requestUpdatePillReexpand = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_UPDATE_REEXPAND_EVENT));
};

export const registerAppServiceWorker = async () => {
  if (registered) return;
  registered = true;

  if (!shouldRegisterAppServiceWorker()) {
    unregisterAppServiceWorkers().catch(() => undefined);
    return;
  }

  // If there was no controller at boot, the first controllerchange is the
  // initial takeover on a fresh install — not an update — and must not reload.
  const hadInitialController = !!navigator.serviceWorker.controller;
  let reloadingForUpdate = false;

  const { registerSW } = await import("virtual:pwa-register");

  registerSW({
    immediate: true,
    onNeedRefresh() {
      emitUpdateAvailable();
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      currentRegistration = registration;

      // Cold start with a build already waiting from a previous session.
      if (registration.waiting) activateWaitingUpdateAtBoot(registration);
      watchRegistrationForWaitingWorker(registration);

      const checkForUpdate = () => {
        if (registration.installing) return;
        checkForAppUpdate().catch(() => undefined);
      };

      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          cancelPendingHiddenApply();
          checkForUpdate();
        } else if (document.visibilityState === "hidden" && updateAvailable) {
          scheduleSilentApply();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      // iOS fires these reliably where a hidden-state timer would be frozen.
      const onTeardown = () => {
        if (updateAvailable) applyAppUpdate({ silent: true });
      };
      window.addEventListener("pagehide", onTeardown);
      document.addEventListener("freeze", onTeardown);
      window.addEventListener("focus", checkForUpdate);
      window.addEventListener("pageshow", checkForUpdate);

      // Belt-and-suspenders poll for long-lived open tabs.
      window.setInterval(() => {
        checkForAppUpdate().catch(() => undefined);
      }, 15 * 60 * 1000);

      checkForAppUpdate().catch(() => undefined);
    },
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadingForUpdate) return;
    if (!hadInitialController || (!userInitiatedUpdate && !bootActivationInProgress)) return;

    const fromBoot = bootActivationInProgress;
    bootActivationInProgress = false;
    updateAvailable = false;
    currentRegistration = null;
    reloadingForUpdate = true;

    const doReload = () => window.location.reload();

    if (!fromBoot && document.visibilityState === "visible" && isUpdateBlocked()) {
      const onHidden = () => {
        if (document.visibilityState !== "hidden") return;
        document.removeEventListener("visibilitychange", onHidden);
        doReload();
      };
      document.addEventListener("visibilitychange", onHidden);
      return;
    }

    if (fromBoot || document.visibilityState !== "visible") {
      doReload();
      return;
    }

    window.setTimeout(doReload, 500);
  });
};
