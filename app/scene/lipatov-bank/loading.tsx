import { PixelLoader, PixelSkeleton, PixelSkeletonText } from "@/components/banking/pixel-ui"

export default function LipatovBankSceneLoading() {
  return (
    <main className="min-h-svh bg-background px-4 py-5 text-foreground md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <PixelSkeleton className="h-11 w-40" />
          <PixelSkeleton className="h-11 w-64" />
        </div>
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="pixel-card min-h-[680px] p-6">
            <PixelLoader variant="card" label="scene bank screen" />
            <div className="mt-8 space-y-4">
              <PixelSkeleton className="h-24" />
              <PixelSkeleton className="h-40" />
              <PixelSkeletonText lines={5} />
            </div>
          </div>
          <div className="space-y-5">
            <div className="pixel-card p-5"><PixelSkeletonText lines={6} /></div>
            <div className="pixel-card p-5"><PixelLoader variant="dots" label="controls" /></div>
          </div>
        </section>
      </div>
    </main>
  )
}
