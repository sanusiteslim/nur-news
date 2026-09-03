'use client'

import { RefreshCw } from 'lucide-react'

export default function UpdateToast({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 bg-gray-900 text-white text-sm rounded-full pl-4 pr-2 py-2 shadow-lg">
        <span>A new version of NUR Report is available.</span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 bg-white text-gray-900 font-medium rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>
    </div>
  )
}
