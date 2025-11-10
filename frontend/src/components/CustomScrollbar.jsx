// src/components/CustomScrollbar.jsx
'use client';

import React, { useEffect, useRef } from 'react';

const CustomScrollbar = ({ children, className = '', ...props }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const styleId = 'custom-scrollbar-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ultra-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
      }

      /* WebKit Scrollbar */
      .ultra-scrollbar::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }

      .ultra-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 9999px;
        margin: 4px;
      }

      .ultra-scrollbar::-webkit-scrollbar-corner {
        background: transparent;
      }

      .ultra-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #00d4aa 0%, #007cf0 100%);
        border-radius: 9999px;
        border: 2.5px solid transparent;
        background-clip: content-box;
        box-shadow: 
          inset 0 0 10px rgba(0, 212, 170, 0.4),
          0 0 16px rgba(0, 124, 240, 0.25),
          inset -4px -4px 8px rgba(255, 255, 255, 0.12),
          inset 4px 4px 8px rgba(0, 0, 0, 0.25),
          0 0 20px rgba(0, 255, 200, 0.2);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
      }

      .ultra-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #00e6b8 0%, #0099ff 100%);
        box-shadow: 
          inset 0 0 14px rgba(0, 255, 255, 0.5),
          0 0 24px rgba(0, 153, 255, 0.4),
          inset -5px -5px 10px rgba(255, 255, 255, 0.2),
          inset 5px 5px 10px rgba(0, 0, 0, 0.35),
          0 0 30px rgba(0, 255, 255, 0.3);
        transform: scale(1.08);
        border-width: 2px;
      }

      /* DARK MODE */
      .dark .ultra-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #00f5c4 0%, #00c3ff 100%);
        box-shadow: 
          inset 0 0 12px rgba(0, 255, 200, 0.35),
          0 0 18px rgba(0, 195, 255, 0.25),
          inset -3px -3px 6px rgba(255, 255, 255, 0.08),
          inset 3px 3px 6px rgba(0, 0, 0, 0.5),
          0 0 22px rgba(0, 255, 255, 0.18);
      }

      .dark .ultra-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #00ffdd 0%, #00d4ff 100%);
        box-shadow: 
          inset 0 0 16px rgba(0, 255, 255, 0.45),
          0 0 28px rgba(0, 200, 255, 0.4),
          inset -6px -6px 12px rgba(255, 255, 255, 0.15),
          inset 6px 6px 12px rgba(0, 0, 0, 0.6),
          0 0 35px rgba(0, 255, 255, 0.35);
        transform: scale(1.1);
      }

      /* Glassmorphic backdrop */
      .ultra-scrollbar {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`ultra-scrollbar overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default CustomScrollbar;