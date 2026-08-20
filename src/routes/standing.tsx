import { createFileRoute, redirect } from "@tanstack/react-router";

// Standing & Fallen now lives on each path page. Old links land on the path list.
export const Route = createFileRoute("/standing")({
  beforeLoad: () => {
    throw redirect({ to: "/paths" });
  },
  component: () => null,
});
