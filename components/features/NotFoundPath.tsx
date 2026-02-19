'use client';

import { useEffect, useState } from 'react';

export function NotFoundPath() {
  const [path, setPath] = useState('/unknown');

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  return <span>{path}</span>;
}
