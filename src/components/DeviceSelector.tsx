import React, { useState, useEffect } from "react";

interface DeviceSelectorProps {
  device: { width: number; height: number; name: string };
  setDevice: (device: { width: number; height: number; name: string }) => void;
}

const devices = [
  { name: "Desktop (1920x1080)", width: 1920, height: 1080 },
  { name: "Laptop (1366x768)", width: 1366, height: 768 },
  { name: "Tablet (768x1024)", width: 768, height: 1024 },
  { name: "Mobile (375x667)", width: 375, height: 667 },
  { name: "Mobile Small (320x568)", width: 320, height: 568 },
];

export default function DeviceSelector({
  device,
  setDevice,
}: DeviceSelectorProps) {
  const [scaleFactor, setScaleFactor] = useState(1);

  // Calculate a scale factor based on screen size for preview purposes
  const calculateScaleFactor = () => {
    // Get the available width (accounting for sidebar, padding, etc.)
    const availableWidth = window.innerWidth - 250; // Approx width needed for sidebar
    const availableHeight = window.innerHeight - 200; // Approx height accounting for header and padding
    
    const widthScale = availableWidth / device.width;
    const heightScale = availableHeight / device.height;
    
    // Return the smaller of the two scales
    return Math.min(widthScale, heightScale, 1); // Never scale up (max scale = 1)
  };

  useEffect(() => {
    setScaleFactor(calculateScaleFactor());
    const handleResize = () => setScaleFactor(calculateScaleFactor());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [device]);

  return (
    <div className="p-4 bg-gray-900 text-white flex items-center">
      <label className="mr-2 font-semibold">Device:</label>
      <select
        value={device.name}
        onChange={(e) => {
          const selected = devices.find((d) => d.name === e.target.value);
          if (selected) setDevice(selected);
        }}
        className="bg-gray-800 text-white p-1 rounded"
      >
        {devices.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>
      <div className="ml-4 text-xs text-gray-400">
        Scale: {Math.round(scaleFactor * 100)}%
      </div>
    </div>
  );
}