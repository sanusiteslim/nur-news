// components/AdUnit.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface AdUnitProps {
  slot: string; // e.g., '1234567890'
  format?: 'auto' | 'rectangle' | 'leaderboard';
}

export default function AdUnit({ slot, format = 'rectangle' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load when 200px away from viewport
    );

    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && typeof window !== 'undefined' && (window as any).googletag) {
      (window as any).googletag.cmd.push(() => {
        (window as any).googletag.display(adRef.current);
      });
    }
  }, [isVisible]);

  // Reserve exact dimensions to prevent Cumulative Layout Shift (CLS)
  const dimensions = {
    rectangle: 'aspect-[300/250]',
    leaderboard: 'aspect-[728/90]',
    auto: 'aspect-[1/1]',
  };

  return (
    <div 
      ref={adRef} 
      className={`w-full max-w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 rounded my-6 overflow-hidden ${dimensions[format]}`}
      style={{ minHeight: format === 'leaderboard' ? '90px' : '250px' }}
    >
      {isVisible ? (
        <div id={`ad-slot-${slot}`} className="w-full h-full" />
      ) : (
        <span>Advertisement (Loading...)</span>
      )}
    </div>
  );
}