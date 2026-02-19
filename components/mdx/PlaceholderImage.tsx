'use client';

import { useState, useCallback } from 'react';

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
    <span className={`placeholder-image-wrapper ${loaded ? 'loaded' : ''} ${className}`}>
      {!loaded && <span className="placeholder-image-skeleton" />}
      <img
        src={src}
        alt={alt || ''}
        className={`placeholder-image ${loaded ? 'visible' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {error && <span className="placeholder-image-error">Failed to load image</span>}
    </span>
  );
}
