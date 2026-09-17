import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EEF1F8' }}>
      <div className="card p-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-compass text-xl text-slate-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Page not found</h2>
        <p className="text-sm text-slate-500 mt-1.5">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block mt-5 px-4 py-2 bg-atria text-white rounded-xl text-sm font-semibold hover:bg-atria-dark transition-colors">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
