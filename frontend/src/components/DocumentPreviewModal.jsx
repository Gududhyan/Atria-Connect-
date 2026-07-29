import React from 'react'
import Modal from './Modal'

export default function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null

  // Determine if it's an image or PDF based on data URL mime type
  const isImage = document.url.startsWith('data:image/')
  const isPdf = document.url.startsWith('data:application/pdf')

  return (
    <Modal title={`Preview: ${document.name}`} size="lg" onClose={onClose}>
      <div className="w-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[50vh]">
        {isImage && (
          <img 
            src={document.url} 
            alt={document.name} 
            className="max-w-full max-h-[70vh] object-contain"
          />
        )}
        {isPdf && (
          <iframe 
            src={document.url} 
            title={document.name}
            className="w-full h-[70vh] border-none"
          />
        )}
        {!isImage && !isPdf && (
          <div className="p-8 text-center">
            <i className="fas fa-file-alt text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500 text-sm">Preview not available for this file type.</p>
            <a 
              href={document.url} 
              download={document.name}
              className="mt-4 inline-block px-4 py-2 bg-atria text-white rounded-lg text-sm font-semibold"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </Modal>
  )
}
