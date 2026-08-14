import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lanes/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/paths/$id",
      params: { id: params.id },
      search: { newlyCreated: false },
      replace: true,
    });
  },
});
