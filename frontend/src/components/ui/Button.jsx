export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', children, ...props }) {
  const VARIANTS = {
    primary: 'bg-atria text-white border border-transparent hover:bg-atria-dark shadow-card',
    secondary: 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:text-slate-900',
    success: 'bg-ok text-white border border-transparent hover:bg-ok-dark shadow-card',
    danger: 'bg-no text-white border border-transparent hover:bg-no-dark shadow-card',
    subtle: 'bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200 shadow-sm'
  }

  const SIZES = {
    xs: 'h-8 px-3 text-[11px]',
    sm: 'h-10 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base'
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl font-semibold transition duration-200 ease-out ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
