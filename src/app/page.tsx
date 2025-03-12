"use client";

import React, { useState } from "react";
import DndWrapper from "../components/DndWrapper";
import FrameworkSelector from "../components/FrameworkSelector";
import Toolbox from "../components/Toolbox";
import Canvas from "../components/Canvas";
import DeviceSelector from "../components/DeviceSelector";

export default function Home() {
  const [framework, setFramework] = useState("React");
  const [device, setDevice] = useState({
    name: "Desktop (1920x1080)",
    width: 1920,
    height: 1080,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <DndWrapper>
        <div className="flex">
          <Toolbox />
          <div className="flex-1">
            <div className="flex justify-between">
              <FrameworkSelector
                framework={framework}
                setFramework={setFramework}
              />
              <DeviceSelector device={device} setDevice={setDevice} />
            </div>
            <Canvas framework={framework} device={device} />
          </div>
        </div>
      </DndWrapper>
    </div>
  );
}
