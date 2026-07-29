import React, { useEffect, useState } from 'react'
import Modal from './Modal'

export default function DocumentPreviewModal({ document, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    if (!document || !document.url) {
      setBlobUrl(null)
      return
    }

    // Convert Data URL to Blob URL for iframes to bypass browser security blocks on data URIs
    if (document.url.startsWith('data:')) {
      fetch(document.url)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob)
          setBlobUrl(url)
        })
        .catch(() => setBlobUrl(document.url)) // Fallback if fetch fails
    } else {
      setBlobUrl(document.url)
    }

    return () => {
      // Clean up the object URL when modal unmounts
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [document])

  if (!document) return null

  const isImage = document.url.startsWith('data:image/') || document.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPdf = document.url.startsWith('data:application/pdf') || document.name.match(/\.pdf$/i)
  
  // Use blobUrl if available to prevent iframe blocking, otherwise fallback to the raw data url (for images)
  const renderUrl = blobUrl || document.url

  return (
    <Modal title={`Preview: ${document.name}`} size="lg" onClose={onClose}>
      <div className="w-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[50vh]">
        {isImage && (
          <img 
            src={renderUrl} 
            alt={document.name} 
            className="max-w-full max-h-[70vh] object-contain"
          />
        )}
        {isPdf && blobUrl && (
          <iframe 
            src={renderUrl} 
            title={document.name}
            className="w-full h-[70vh] border-none"
          />
        )}
        {isPdf && !blobUrl && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Loading document preview...</p>
          </div>
        )}
        {!isImage && !isPdf && (
          <div className="p-8 text-center">
            <i className="fas fa-file-alt text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500 text-sm">Preview not available for this file type.</p>
            <a 
              href={renderUrl} 
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
