import { queryOptions } from "@tanstack/react-query";
import { getDashboard, getCheckinPage, listMyLanes, getPartnerView, getSettings } from "@/lib/api.functions";
import { saveCheckinCache, readCheckinCache, isNetworkError } from "@/lib/offline-checkins";

// Keep visited tabs available in memory without extending data freshness.
const tabCache = { staleTime: 45_000, gcTime: 30 * 60_000 };
export const dashboardOptions = (call = getDashboard) => queryOptions({ ...tabCache, queryKey: ["dashboard"], queryFn: () => call() });
export const pathsOptions = (call = listMyLanes) => queryOptions({ ...tabCache, queryKey: ["lanes"], queryFn: () => call() });
export const partnerOptions = (call = getPartnerView) => queryOptions({ ...tabCache, queryKey: ["partner"], queryFn: () => call() });
export const settingsOptions = (call = getSettings) => queryOptions({ ...tabCache, queryKey: ["settings"], queryFn: () => call() });

export async function loadCheckin(call = getCheckinPage) {
  try {
    const data = await call();
    saveCheckinCache(data);
    return { ...data, offline: false };
  } catch (error) {
    const cached = readCheckinCache<Awaited<ReturnType<typeof getCheckinPage>>>();
    if (cached && isNetworkError(error)) return { ...cached, offline: true };
    throw error;
  }
}
export const checkinOptions = (call = getCheckinPage) => queryOptions({ ...tabCache, queryKey: ["checkin"], queryFn: () => loadCheckin(call) });