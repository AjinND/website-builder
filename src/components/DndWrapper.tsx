"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import React, { useEffect, useState } from "react";

export default function DndWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track if we're mounted on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR or before hydration, render a placeholder
  if (!isMounted) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    );
  }

  // Only render the DndProvider on the client after hydration
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-auto">
        {children}
      </div>
    </DndProvider>
  );
}