import { StyleEditorProps, DroppedElementType } from "@/types/types";
import React, { useState } from "react";

export default function StyleEditor({
  element,
  onUpdate,
  onDelete,
  isDarkTheme = true,
}: StyleEditorProps) {
  const [activeTab, setActiveTab] = useState<"style" | "content">("style");

  // Helper function to get theme-appropriate class names for inputs
  const getInputClassName = (baseClasses: string) => {
    return `${baseClasses} ${
      isDarkTheme
        ? "bg-gray-700 text-white"
        : "bg-white text-gray-800 border border-gray-300"
    }`;
  };

  const handleChange = (newStyles: { [key: string]: any }) => {
    onUpdate({
      ...element,
      properties: {
        ...element.properties,
        ...newStyles,
      },
    });
  };

  // Function to determine the input type based on property value
  const getInputType = (value: any): string => {
    if (typeof value === "boolean") return "checkbox";
    if (typeof value === "number") return "number";
    if (typeof value === "string" && value.startsWith("#")) return "color";
    if (typeof value === "string" && value.endsWith("px")) return "number";
    return "text";
  };

  // Function to handle array properties (like navLinks, menuItems)
  const handleArrayPropertyChange = (
    propertyName: string,
    index: number,
    field: string,
    value: string
  ) => {
    const updatedArray = [...element.properties[propertyName]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    handleChange({ [propertyName]: updatedArray });
  };

  // Function to add new item to array property
  const handleAddArrayItem = (propertyName: string, template: any) => {
    const updatedArray = [
      ...(element.properties[propertyName] || []),
      template,
    ];
    handleChange({ [propertyName]: updatedArray });
  };

  // Function to remove specific item from array property
  const handleRemoveArrayItem = (propertyName: string, index: number) => {
    const updatedArray = [...element.properties[propertyName]];
    updatedArray.splice(index, 1);
    handleChange({ [propertyName]: updatedArray });
  };

  // Function to categorize properties
  const categorizeProperties = () => {
    const styleProps: { [key: string]: any } = {};
    const contentProps: { [key: string]: any } = {};

    Object.entries(element.properties).forEach(([key, value]) => {
      if (
        key.includes("color") ||
        key.includes("size") ||
        key.includes("width") ||
        key.includes("height") ||
        key.includes("margin") ||
        key.includes("padding") ||
        key.includes("border") ||
        key.includes("radius") ||
        key.includes("shadow") ||
        key.includes("font") ||
        key.includes("background") ||
        key.includes("opacity") ||
        key.includes("transform") ||
        key.includes("transition") ||
        key.includes("animation") ||
        key.includes("display") ||
        key.includes("position") ||
        key.includes("z-index") ||
        key.includes("overflow") ||
        key.includes("cursor") ||
        key.includes("text-align") ||
        key.includes("line-height") ||
        key.includes("letter-spacing") ||
        key.includes("text-transform") ||
        key.includes("text-decoration") ||
        key.includes("white-space") ||
        key.includes("word-break") ||
        key.includes("word-wrap") ||
        key.includes("vertical-align") ||
        key.includes("list-style") ||
        key.includes("outline") ||
        key.includes("box-shadow") ||
        key.includes("filter") ||
        key.includes("backdrop-filter") ||
        key.includes("perspective") ||
        key.includes("backface-visibility") ||
        key.includes("transform-style") ||
        key.includes("transform-origin") ||
        key.includes("transition-property") ||
        key.includes("transition-duration") ||
        key.includes("transition-timing-function") ||
        key.includes("transition-delay") ||
        key.includes("animation-name") ||
        key.includes("animation-duration") ||
        key.includes("animation-timing-function") ||
        key.includes("animation-delay") ||
        key.includes("animation-iteration-count") ||
        key.includes("animation-direction") ||
        key.includes("animation-fill-mode") ||
        key.includes("animation-play-state")
      ) {
        styleProps[key] = value;
      } else {
        contentProps[key] = value;
      }
    });

    return { styleProps, contentProps };
  };

  // Function to render input based on property type
  const renderPropertyInput = (propertyName: string, value: any) => {
    const inputType = getInputType(value);

    if (Array.isArray(value)) {
      return (
        <div className="col-span-3 mb-4">
          <h4 className="text-sm font-medium mb-2 capitalize">
            {propertyName.replace(/([A-Z])/g, " $1").trim()}
          </h4>
          <div className="space-y-2">
            {value.map((item: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  isDarkTheme ? "bg-gray-700" : "bg-gray-100"
                } relative`}
              >
                <button
                  onClick={() => handleRemoveArrayItem(propertyName, index)}
                  className={`absolute top-2 right-2 p-1 rounded-full ${
                    isDarkTheme
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white`}
                  title="Delete item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(item).map(([field, fieldValue]) => (
                    <label key={field} className="block">
                      <span className="text-xs text-gray-400 capitalize">
                        {field.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <input
                        type="text"
                        value={fieldValue as string}
                        onChange={(e) =>
                          handleArrayPropertyChange(
                            propertyName,
                            index,
                            field,
                            e.target.value
                          )
                        }
                        className={getInputClassName("ml-2 w-full p-1 rounded")}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              handleAddArrayItem(propertyName, { text: "New Item", url: "/" })
            }
            className={`px-3 py-1 rounded mt-2 flex items-center ${
              isDarkTheme
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add {propertyName.replace(/([A-Z])/g, " $1").trim()}
          </button>
        </div>
      );
    }

    if (inputType === "checkbox") {
      return (
        <div className="flex items-center mb-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  handleChange({ [propertyName]: e.target.checked })
                }
                className="sr-only"
              />
              <div
                className={`block w-10 h-6 rounded-full ${
                  value
                    ? isDarkTheme
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDarkTheme
                    ? "bg-gray-600"
                    : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                  value ? "transform translate-x-4" : ""
                }`}
              ></div>
            </div>
            <div className="ml-3 capitalize">
              {propertyName.replace(/([A-Z])/g, " $1").trim()}
            </div>
          </label>
        </div>
      );
    }

    if (inputType === "color") {
      return (
        <div className="mb-3">
          <label className="block text-sm capitalize mb-1">
            {propertyName.replace(/([A-Z])/g, " $1").trim()}
          </label>
          <div className="flex items-center">
            <input
              type="color"
              value={value}
              onChange={(e) => handleChange({ [propertyName]: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange({ [propertyName]: e.target.value })}
              className={getInputClassName("ml-2 w-24 p-1 rounded text-sm")}
            />
          </div>
        </div>
      );
    }

    if (inputType === "number") {
      const numericValue = typeof value === "string" ? parseInt(value) : value;
      const isSize =
        propertyName.toLowerCase().includes("size") ||
        propertyName.toLowerCase().includes("width") ||
        propertyName.toLowerCase().includes("height") ||
        propertyName.toLowerCase().includes("margin") ||
        propertyName.toLowerCase().includes("padding") ||
        propertyName.toLowerCase().includes("border") ||
        propertyName.toLowerCase().includes("radius");

      return (
        <div className="mb-3">
          <label className="block text-sm capitalize mb-1">
            {propertyName.replace(/([A-Z])/g, " $1").trim()}
          </label>
          <div className="flex items-center">
            <input
              type="number"
              value={numericValue}
              onChange={(e) => {
                const newValue = e.target.value;
                handleChange({
                  [propertyName]: isSize ? `${newValue}px` : newValue,
                });
              }}
              className={getInputClassName("w-20 p-1 rounded text-sm")}
            />
            {isSize && <span className="ml-2 text-sm text-gray-400">px</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-3">
        <label className="block text-sm capitalize mb-1">
          {propertyName.replace(/([A-Z])/g, " $1").trim()}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange({ [propertyName]: e.target.value })}
          className={getInputClassName("w-full p-1 rounded text-sm")}
        />
      </div>
    );
  };

  const { styleProps, contentProps } = categorizeProperties();

  return (
    <div
      className={`p-4 ${
        isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Element Properties</h3>
          <button
            onClick={onDelete}
            className={`px-3 py-1 rounded flex items-center ${
              isDarkTheme
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Element
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-600">
          <div className="flex">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "style"
                  ? isDarkTheme
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "border-b-2 border-blue-500 text-blue-600"
                  : isDarkTheme
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("style")}
            >
              Style Properties
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === "content"
                  ? isDarkTheme
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "border-b-2 border-blue-500 text-blue-600"
                  : isDarkTheme
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Content Properties
            </button>
          </div>
        </div>

        {/* Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === "style" &&
            Object.entries(styleProps).map(([propertyName, value]) => (
              <div
                key={propertyName}
                className={`p-3 rounded-md ${
                  isDarkTheme ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                {renderPropertyInput(propertyName, value)}
              </div>
            ))}

          {activeTab === "content" &&
            Object.entries(contentProps).map(([propertyName, value]) => (
              <div
                key={propertyName}
                className={`p-3 rounded-md ${
                  isDarkTheme ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                {renderPropertyInput(propertyName, value)}
              </div>
            ))}

          {activeTab === "style" && Object.keys(styleProps).length === 0 && (
            <div className="col-span-3 text-center py-4 text-gray-400">
              No style properties available for this element
            </div>
          )}

          {activeTab === "content" &&
            Object.keys(contentProps).length === 0 && (
              <div className="col-span-3 text-center py-4 text-gray-400">
                No content properties available for this element
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
