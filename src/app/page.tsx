"use client";

import React from "react";
import dynamic from 'next/dynamic';

// Use dynamic imports with SSR disabled for components that use client-only features
const DndWrapper = dynamic(() => import('@/components/DndWrapper'), { ssr: false });
const PageManager = dynamic(() => import('@/components/PageManager'), { ssr: false });

export default function Home() {
  return (
    <div className="h-screen overflow-auto bg-black text-white">
      <DndWrapper>
        <PageManager />
      </DndWrapper>
    </div>
  );
}
