import React, { useState } from "react";

interface DeviceSelectorProps {
  device: { width: number; height: number; name: string };
  setDevice: (device: { width: number; height: number; name: string }) => void;
  isDarkTheme?: boolean;
}

// Expanded device list with more options
const devices = [
  { name: "Desktop Large (1920x1080)", width: 1920, height: 1080, icon: "🖥️" },
  { name: "Desktop Small (1440x900)", width: 1440, height: 900, icon: "🖥️" },
  { name: "Laptop (1366x768)", width: 1366, height: 768, icon: "💻" },
  { name: "Tablet Landscape (1024x768)", width: 1024, height: 768, icon: "📱" },
  { name: "Tablet Portrait (768x1024)", width: 768, height: 1024, icon: "📱" },
  { name: "Mobile Large (414x896)", width: 414, height: 896, icon: "📱" },
  { name: "Mobile Medium (375x667)", width: 375, height: 667, icon: "📱" },
  { name: "Mobile Small (320x568)", width: 320, height: 568, icon: "📱" },
];

// Group devices by category
const deviceCategories = [
  { name: "Desktop", devices: devices.filter(d => d.width >= 1200) },
  { name: "Tablet", devices: devices.filter(d => d.width >= 600 && d.width < 1200) },
  { name: "Mobile", devices: devices.filter(d => d.width < 600) },
];

export default function DeviceSelector({
  device,
  setDevice,
  isDarkTheme = true,
}: DeviceSelectorProps) {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  const handleCustomDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (width > 0 && height > 0) {
      setDevice({
        name: `Custom (${width}x${height})`,
        width,
        height,
      });
      setShowDeviceMenu(false);
      setCustomWidth("");
      setCustomHeight("");
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    const device = devices.find(d => d.name === deviceName);
    return device?.icon || "📱";
  };

  return (
    <div className={`relative ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
      <div className="flex items-center">
        <button
          onClick={() => setShowDeviceMenu(!showDeviceMenu)}
          className={`flex items-center space-x-2 px-3 py-2 rounded ${
            isDarkTheme
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          <span>{getDeviceIcon(device.name)}</span>
          <span>{device.name}</span>
          <span className="text-xs text-gray-400">({device.width}x{device.height})</span>
          <span className="ml-2">{showDeviceMenu ? "▲" : "▼"}</span>
        </button>

        <button
          onClick={() => {
            // Toggle orientation by swapping width and height
            setDevice({
              name: `${device.name} (Rotated)`,
              width: device.height,
              height: device.width,
            });
          }}
          className={`ml-2 px-3 py-2 rounded ${
            isDarkTheme
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
          title="Rotate device"
        >
          🔄
        </button>
      </div>

      {showDeviceMenu && (
        <div
          className={`absolute z-10 mt-1 w-64 rounded-md shadow-lg ${
            isDarkTheme ? "bg-gray-800" : "bg-white border border-gray-200"
          }`}
        >
          <div className="py-1">
            {deviceCategories.map((category) => (
              <div key={category.name} className="px-2 py-1">
                <div className={`text-xs font-semibold mb-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                  {category.name}
                </div>
                {category.devices.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => {
                      setDevice(d);
                      setShowDeviceMenu(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm rounded ${
                      device.name === d.name
                        ? (isDarkTheme ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800")
                        : (isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-100")
                    }`}
                  >
                    <span className="mr-2">{d.icon}</span>
                    {d.name}
                  </button>
                ))}
              </div>
            ))}

            <div className="border-t border-gray-700 mt-1 pt-2 px-3">
              <div className={`text-xs font-semibold mb-1 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}>
                Custom Size
              </div>
              <form onSubmit={handleCustomDeviceSubmit} className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className={`w-20 px-2 py-1 text-sm rounded ${
                    isDarkTheme
                      ? "bg-gray-700 text-white border border-gray-600"
                      : "bg-white text-gray-800 border border-gray-300"
                  }`}
                  min="200"
                  max="3000"
                />
                <span>×</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  className={`w-20 px-2 py-1 text-sm rounded ${
                    isDarkTheme
                      ? "bg-gray-700 text-white border border-gray-600"
                      : "bg-white text-gray-800 border border-gray-300"
                  }`}
                  min="200"
                  max="3000"
                />
                <button
                  type="submit"
                  className={`px-2 py-1 text-sm rounded ${
                    isDarkTheme
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Set
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}