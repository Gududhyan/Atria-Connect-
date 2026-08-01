import { useEffect, useCallback } from 'react'

export default function Modal({ children, size, title, onClose, footer }) {
  const w = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-xl'
  
  const esc = useCallback((e) => {
    if (e.key === 'Escape' && onClose) onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [esc])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" 
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} 
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}
    >
      <div 
        className={`bg-white rounded-2xl w-full ${w} max-h-[90vh] flex flex-col overflow-hidden fade-in border border-slate-200 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          {title && <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>}
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close (Esc)"
            >
              <i className="fas fa-xmark text-base" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
          {footer ? footer : (
            onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}