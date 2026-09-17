'use client'

import { useEffect, useState } from 'react'
import Modal from './Modal'

export default function DocumentPreviewModal({ document: doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true
    let createdUrl = null

    if (!doc?.url) {
      setBlobUrl(null)
      setIsLoading(false)
      setHasError(false)
      return
    }

    const docUrl = doc.url

    if (docUrl.startsWith('data:')) {
      setIsLoading(true)
      setHasError(false)

      fetch(docUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (!isMounted) return
          createdUrl = URL.createObjectURL(blob)
          setBlobUrl(createdUrl)
          setIsLoading(false)
        })
        .catch(() => {
          if (!isMounted) return
          setBlobUrl(docUrl)
          setIsLoading(false)
        })
    } else {
      setBlobUrl(docUrl)
      setIsLoading(false)
      setHasError(false)
    }

    return () => {
      isMounted = false
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [doc])

  if (!doc) return null

  const name = doc.name || 'Document'
  const url = doc.url || ''

  const isImage =
    url.startsWith('data:image/') ||
    url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i) ||
    name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)

  const isPdf =
    url.startsWith('data:application/pdf') ||
    url.match(/\.pdf(\?.*)?$/i) ||
    name.match(/\.pdf$/i) ||
    (!isImage && (url.includes('/uploads/') || url.startsWith('blob:')))

  const renderUrl = blobUrl || url

  const footer = (
    <div className="w-full flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {renderUrl && (
          <a
            href={renderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <i className="fas fa-arrow-up-right-from-square text-xs" />
            Open in New Tab
          </a>
        )}
        {renderUrl && (
          <a
            href={renderUrl}
            download={name}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-atria hover:bg-atria-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <i className="fas fa-download text-xs" />
            Download File
          </a>
        )}
      </div>

      <button
        onClick={onClose}
        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
      >
        Close
      </button>
    </div>
  )

  return (
    <Modal title={`Preview: ${name}`} size="lg" onClose={onClose} footer={footer}>
      <div className="w-full flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[40vh] sm:min-h-[45vh] relative">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-3">
            <i className="fas fa-circle-notch fa-spin text-3xl text-atria" />
            <p className="text-sm font-medium">Preparing document preview...</p>
          </div>
        )}

        {!isLoading && isImage && (
          <div className="p-4 flex items-center justify-center w-full min-h-[40vh] max-h-[55vh] overflow-auto">
            <img
              src={renderUrl}
              alt={name}
              className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-sm"
              onError={() => setHasError(true)}
            />
          </div>
        )}

        {!isLoading && isPdf && !hasError && (
          <div className="w-full h-[50vh] sm:h-[55vh] max-h-[550px] relative flex flex-col">
            <iframe src={renderUrl} title={name} className="w-full h-full border-none rounded-xl" />
          </div>
        )}

        {!isLoading && (hasError || (!isImage && !isPdf)) && (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <i className="fas fa-file-pdf text-3xl text-atria" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Document Display</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Your browser cannot render this file inline. You can open it in a new window or download it below.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={renderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
              >
                <i className="fas fa-external-link-alt" /> Open in New Window
              </a>
              <a
                href={renderUrl}
                download={name}
                className="px-4 py-2 bg-atria text-white rounded-xl text-xs font-bold shadow hover:bg-atria-dark transition-colors inline-flex items-center gap-2"
              >
                <i className="fas fa-download" /> Download
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
