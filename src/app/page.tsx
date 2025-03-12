"use client";

import Canvas from "@/components/Canvas";
import DndWrapper from "@/components/DndWrapper";
import FrameworkSelector from "@/components/FrameworkSelector";
import Toolbox from "@/components/Toolbox";
import React, { useState } from "react";

export default function Home() {
  const [framework, setFramework] = useState("React");

  return (
    <div className="min-h-screen bg-black text-white">
      <DndWrapper>
        <div className="flex">
          <Toolbox />
          <div className="flex-1">
            <FrameworkSelector
              framework={framework}
              setFramework={setFramework}
            />
            <Canvas framework={framework} />
          </div>
        </div>
      </DndWrapper>
    </div>
  );
}
