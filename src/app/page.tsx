import React from "react";
import DndWrapper from "@/components/DndWrapper";
import PageManager from "@/components/PageManager";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <DndWrapper>
        <PageManager />
      </DndWrapper>
    </div>
  );
}
