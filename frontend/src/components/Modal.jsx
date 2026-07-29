import { useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'

export default function Modal({ children, size, title, onClose }) {
  const w = size==='sm'?'max-w-sm':size==='lg'?'max-w-2xl':'max-w-lg'
  const esc = useCallback((e)=>{if(e.key==='Escape' && onClose)onClose()},[onClose])
  useEffect(()=>{
    document.addEventListener('keydown',esc)
    document.body.style.overflow='hidden'
    return ()=>{document.removeEventListener('keydown',esc);document.body.style.overflow=''}
  },[esc])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(10,12,30,0.4)',backdropFilter:'blur(3px)'}} onClick={(e)=>{if(e.target===e.currentTarget && onClose)onClose()}}>
      <div className={"bg-white rounded-2xl w-full "+w+" max-h-[85vh] overflow-y-auto anim-up"} style={{boxShadow:'0 20px 50px rgba(0,0,0,0.15)'}}>
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          {title && <h3 className="font-bold text-gray-900">{title}</h3>}
          <button onClick={onClose} style={{width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer',color:'#999'}} className="hover:bg-gray-100">
            <i className="fas fa-xmark" style={{fontSize:13}}/>
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  )
}