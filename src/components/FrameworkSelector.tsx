import React, { useState } from "react";

interface FrameworkSelectorProps {
  framework: string;
  setFramework: (framework: string) => void;
  isDarkTheme?: boolean;
}

interface FrameworkOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  version: string;
}

const frameworks: FrameworkOption[] = [
  {
    value: "React",
    label: "React",
    icon: "⚛️",
    description: "A JavaScript library for building user interfaces",
    version: "React 18 with React Router 6"
  },
  {
    value: "Angular",
    label: "Angular",
    icon: "🅰️",
    description: "Platform for building mobile and desktop web applications",
    version: "Angular 15 (Limited Support)"
  },
  {
    value: "Vue",
    label: "Vue",
    icon: "🟢",
    description: "Progressive JavaScript framework for building UIs",
    version: "Vue 3 (Limited Support)"
  }
];

export default function FrameworkSelector({
  framework,
  setFramework,
  isDarkTheme = true,
}: FrameworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentFramework = frameworks.find(f => f.value === framework) || frameworks[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded ${
          isDarkTheme
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-white border border-gray-300 hover:bg-gray-100"
        }`}
      >
        <span>{currentFramework.icon}</span>
        <span>{currentFramework.label}</span>
        <span className="ml-1">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-64 rounded-md shadow-lg ${
            isDarkTheme ? "bg-gray-800" : "bg-white border border-gray-200"
          }`}
        >
          <div className="py-1">
            {frameworks.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFramework(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 ${
                  framework === option.value
                    ? (isDarkTheme ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800")
                    : (isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-100")
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
                <div className={`text-xs mt-1 ${isDarkTheme ? "text-gray-400" : "text-gray-600"}`}>
                  {option.description}
                </div>
                <div className={`text-xs mt-1 ${isDarkTheme ? "text-gray-500" : "text-gray-500"}`}>
                  {option.version}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}