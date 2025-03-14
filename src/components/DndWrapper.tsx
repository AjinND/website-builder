"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import React, { useEffect, useState } from "react";

export default function DndWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track if the browser supports HTML5 drag and drop
  const [isCompatible, setIsCompatible] = useState(true);

  useEffect(() => {
    // Check if we're in a browser that supports HTML5 drag and drop
    const isCompatibleBrowser = 
      typeof window !== 'undefined' && 
      typeof document !== 'undefined' &&
      'ondragstart' in document.documentElement;
    
    setIsCompatible(isCompatibleBrowser);
  }, []);

  if (!isCompatible) {
    return (
      <div className="p-4 bg-red-500 text-white rounded">
        <p>Your browser does not fully support drag and drop operations.</p>
        <p>For the best experience, please use a modern browser like Chrome, Firefox, or Edge.</p>
        {children}
      </div>
    );
  }

  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}