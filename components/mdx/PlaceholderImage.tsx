'use client';

import { useState, useCallback } from 'react';
import { cx } from '@/lib/cx';
import s from './PlaceholderImage.module.css';

interface PlaceholderImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function PlaceholderImage({ src, alt, className = '' }: PlaceholderImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
  }, []);

  if (!src) return null;

  return (
    <span className={cx(s.placeholderImageWrapper, loaded && s.loaded, className)}>
      {!loaded && <span className={s.placeholderImageSkeleton} />}
      <img
        src={src}
        alt={alt || ''}
        className={cx(s.placeholderImage, loaded && s.visible)}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {error && <span className={s.placeholderImageError}>Failed to load image</span>}
    </span>
  );
}
