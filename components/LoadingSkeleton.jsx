// Shown by route-level loading.jsx files while a Server Component fetches.
export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-5 fade-in">
      <div className="space-y-2">
        <div className="skeleton h-6 w-56" />
        <div className="skeleton h-4 w-80" />
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="skeleton h-10 w-36" />
          <div className="skeleton h-10 w-60" />
          <div className="skeleton h-10 w-32" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8ECF2] bg-slate-50/60">
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-20 ml-auto" />
              <div className="skeleton h-7 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 fade-in">
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-44 rounded-2xl" />
          <div className="skeleton h-44 rounded-2xl" />
        </div>
      </div>
      <div className="skeleton h-56 w-full rounded-2xl" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-5 fade-in">
      <div className="space-y-2">
        <div className="skeleton h-6 w-56" />
        <div className="skeleton h-4 w-80" />
      </div>
      <div className="card p-6 space-y-4">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-32 w-full rounded-xl" />
      </div>
    </div>
  )
}
