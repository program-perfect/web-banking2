import { PixelLoader, PixelSkeletonCard } from "@/components/banking/pixel-ui"

export default function Loading() {
  return (
    <main className="min-h-svh bg-background px-4 py-6 md:px-8" aria-busy="true">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="pixel-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="pixel-skeleton h-6 w-56 border-2 border-foreground bg-secondary" />
            <div className="pixel-skeleton h-4 w-80 max-w-full border-2 border-foreground bg-secondary" />
          </div>
          <PixelLoader variant="card" label="Loading bank" />
        </section>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <PixelSkeletonCard tall />
          <PixelSkeletonCard />
          <PixelSkeletonCard />
          <PixelSkeletonCard />
          <PixelSkeletonCard tall />
          <PixelSkeletonCard />
        </div>
      </div>
    </main>
  )
}
