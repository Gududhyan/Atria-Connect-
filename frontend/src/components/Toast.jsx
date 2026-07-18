import { useApp } from '../context/AppContext'

export default function ToastContainer() {
  const {state,dispatch} = useApp()
  return (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
      {state.toasts.map(t=>{
        const bg = t.type==='ok'?'#059669':t.type==='err'?'#dc2626':'#2563eb'
        const ic = t.type==='ok'?'fa-check-circle':t.type==='err'?'fa-exclamation-circle':'fa-info-circle'
        return (
          <div key={t.id} className="px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 text-white min-w-[280px] cursor-pointer" style={{background:bg,boxShadow:'0 4px 16px rgba(0,0,0,0.15)',animation:'slideR 0.25s ease-out'}} onClick={()=>dispatch({type:'REMOVE_TOAST',id:t.id})}>
            <i className={"fas "+ic}/>{t.message}
          </div>
        )
      })}
    </div>
  )
}