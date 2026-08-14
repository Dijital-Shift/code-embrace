import { createFileRoute, redirect } from "@tanstack/react-router";

type LaneNewSearch = { template?: string };

export const Route = createFileRoute("/lanes/new")({
  validateSearch: (search: Record<string, unknown>): LaneNewSearch => ({
    template: typeof search.template === "string" ? search.template : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/paths/new", search, replace: true });
  },
});
