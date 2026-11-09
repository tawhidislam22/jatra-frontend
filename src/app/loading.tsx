import { LoaderCircle } from "lucide-react";

export default function GlobalLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-background px-6 text-foreground"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative grid size-16 place-items-center rounded-full border border-border bg-card shadow-sm">
          <div className="absolute inset-1 rounded-full border-2 border-primary/20" />
          <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Jatra
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            Preparing your ride
          </h1>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Loading the latest vehicle, service, and booking details.
          </p>
        </div>
      </div>
    </main>
  );
}
