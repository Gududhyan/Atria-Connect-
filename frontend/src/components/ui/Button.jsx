const VARIANTS = {
  primary:   'bg-atria text-white hover:bg-atria-dark shadow-sm active:scale-[0.98]',
  secondary: 'bg-white text-slate-700 border border-[#E8ECF2] hover:bg-slate-50 active:scale-[0.98]',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98]',
  ghost:     'text-slate-600 hover:bg-slate-100 active:scale-[0.98]',
}

const SIZES = {
  xs:  'h-7 px-2.5 text-xs rounded-lg gap-1',
  sm:  'h-8 px-3 text-xs rounded-xl gap-1.5',
  md:  'h-9 px-4 text-sm rounded-xl gap-2',
  lg:  'h-11 px-5 text-sm rounded-xl gap-2',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}>
      {children}
    </button>
  )
}
