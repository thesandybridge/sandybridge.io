'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

export function DynamicFavicon() {
  const { colors } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Create or reuse canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 32;
      canvasRef.current.height = 32;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);

    // Draw triangle (matching the site's logo)
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(16, 2);   // Top
    ctx.lineTo(30, 28);  // Bottom right
    ctx.lineTo(2, 28);   // Bottom left
    ctx.closePath();
    ctx.fill();

    // Create favicon link
    const dataUrl = canvas.toDataURL('image/png');

    // Find existing favicon or create new one
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-dynamic="true"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.setAttribute('data-dynamic', 'true');
      document.head.appendChild(link);
    }

    link.href = dataUrl;
  }, [colors.accent]);

  return null;
}
