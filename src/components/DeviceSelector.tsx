import React from "react";

interface DeviceSelectorProps {
  device: { width: number; height: number; name: string };
  setDevice: (device: { width: number; height: number; name: string }) => void;
}

const devices = [
  { name: "Desktop (1920x1080)", width: 1920, height: 1080 },
  { name: "Tablet (768x1024)", width: 768, height: 1024 },
  { name: "Mobile (375x667)", width: 375, height: 667 },
];

export default function DeviceSelector({
  device,
  setDevice,
}: DeviceSelectorProps) {
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
    </div>
  );
}
