import React from "react";

interface StyleEditorProps {
  properties: { [key: string]: any };
  onChange: (newStyles: { [key: string]: any }) => void;
}

export default function StyleEditor({ properties, onChange }: StyleEditorProps) {
  return (
    <div className="p-4 bg-gray-800 text-white">
      <label className="block mb-2">
        Text Color:
        <input
          type="color"
          value={properties.textColor || "#ffffff"}
          onChange={(e) => onChange({ textColor: e.target.value })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        Font Size:
        <input
          type="number"
          value={parseInt(properties.fontSize) || 16}
          onChange={(e) =>
            onChange({ fontSize: `${e.target.value}px` })
          }
          className="ml-2 w-16"
        />
      </label>
      <label className="block mb-2">
        Font Weight:
        <select
          value={properties.fontWeight || "normal"}
          onChange={(e) => onChange({ fontWeight: e.target.value })}
          className="ml-2"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
        </select>
      </label>
      {/* Add more fields as needed, for backgroundColor, etc. */}
    </div>
  );
}
