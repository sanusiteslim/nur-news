'use client';

import { useState, useEffect } from 'react';

export default function ArticleWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Controls the exact loader duration (3000ms = 3 seconds)
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(loaderTimer);
  }, []);

  if (isLoading) {
    return (
      /* 
        Changing 'fixed inset-0' to 'fixed left-0 right-0 bottom-0 top-[var(--nav-height)]'
        forces the loader screen to start exactly below your navbar.
        If your navbar is roughly 64px tall, use 'top-[64px]' below.
      */
      <div className="fixed left-0 right-0 bottom-0 top-[64px] flex flex-col items-center justify-center bg-white z-40">
        <div className="flex flex-col items-center gap-6">
          {/* Grey Brand Logo */}
          <div className="flex items-center text-neutral-400 font-bold tracking-wide select-none">
            <span className="text-3xl ml-1 uppercase">nurr</span>
          </div>
          
          {/* Three Bouncing Grey Dots */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-300 animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
