'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-triangle-exclamation text-xl text-red-500" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Something went wrong</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          {error?.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <button
          onClick={reset}
          className="mt-5 px-4 py-2 bg-atria text-white rounded-xl text-sm font-semibold hover:bg-atria-dark transition-colors">
          Try again
        </button>
      </div>
    </div>
  )
}
