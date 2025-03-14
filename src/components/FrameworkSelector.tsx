import React from "react";

interface FrameworkSelectorProps {
  framework: string;
  setFramework: (framework: string) => void;
}

export default function FrameworkSelector({
  framework,
  setFramework,
}: FrameworkSelectorProps) {
  return (
    <div className="p-4 bg-gray-900 text-white flex items-center">
      <label htmlFor="framework-select" className="mr-2 font-semibold">
        Framework:
      </label>
      <select
        id="framework-select"
        value={framework}
        onChange={(e) => setFramework(e.target.value)}
        className="bg-gray-800 text-white p-1 rounded"
      >
        <option value="React">React (with React Router)</option>
        <option value="Angular">Angular</option>
        <option value="Vue">Vue</option>
      </select>
      <span className="ml-4 text-xs text-gray-400">
        {framework === "React" 
          ? "Using React 18 with React Router for multi-page navigation" 
          : framework === "Angular" 
            ? "Angular support is limited" 
            : "Vue support is limited"}
      </span>
    </div>
  );
}