// Small "this is an opinion piece" badge overlaid on thumbnail corners —
// used on the homepage Opinion teaser and the full /opinion category page.
export default function QuoteBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-1 flex items-center justify-center ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
      </svg>
    </div>
  )
}
