export default function Loading() {
  return (
    <div className="flex min-height-[70vh] w-full flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        
        {/* 1. Brand Logo Icon & Text in Grey */}
        <div className="flex items-center text-neutral-400 font-bold tracking-wide">
          <span className="text-3xl lowercase">nur</span>
          <span className="text-3xl ml-1 uppercase">nurr</span>
        </div>

        {/* 2. Three Bouncing Loading Dots */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce"></div>
        </div>

      </div>
    </div>
  );
}
