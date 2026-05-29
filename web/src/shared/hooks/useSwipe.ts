import { useRef, useState } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontal = useRef<boolean | null>(null);
  const [deltaX, setDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setIsDragging(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Déterminer l'axe dominant au premier mouvement significatif
    if (isHorizontal.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return;

    setIsDragging(true);
    setDeltaX(dx);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const wasHorizontal = isHorizontal.current;

    isHorizontal.current = null;
    touchStartX.current = null;
    touchStartY.current = null;
    setIsDragging(false);
    setDeltaX(0);

    if (!wasHorizontal) return;

    if (delta < -threshold) onSwipeLeft?.();
    else if (delta > threshold) onSwipeRight?.();
  };

  return { onTouchStart, onTouchMove, onTouchEnd, deltaX, isDragging };
}
