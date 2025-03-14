"use client";

import React, { useRef } from "react";
import { useDrag } from "react-dnd";

interface DroppedElementProps {
  element: {
    id: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    properties: { [key: string]: any };
  };
  onResize: (id: number, width: number, height: number) => void;
  onPropertiesChange: (
    id: number,
    newProperties: { [key: string]: any }
  ) => void;
  onSelect: () => void;
  isSelected: boolean;
  availablePages: { id: string; name: string }[];
}

const DroppedElement: React.FC<DroppedElementProps> = ({
  element,
  onResize,
  onPropertiesChange,
  onSelect,
  isSelected,
  availablePages,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "element",
      item: () => ({ id: element.id, type: element.type }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [element.id]
  );

  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    e.preventDefault();
    resizeRef.current = {
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizeRef.current && resizeRef.current.isResizing) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const newWidth = Math.max(50, resizeRef.current.startWidth + dx);
      const newHeight = Math.max(30, resizeRef.current.startHeight + dy);
      onResize(element.id, newWidth, newHeight);
    }
  };

  const handleMouseUp = () => {
    if (resizeRef.current) {
      resizeRef.current.isResizing = false;
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const renderContent = () => {
    switch (element.type) {
      case "header":
        return (
          <div
            className="flex items-center justify-between p-2"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            <img src={element.properties.logoUrl} alt="Logo" className="h-8" />
            <nav>
              {element.properties.navLinks?.map(
                (link: { url: string; text: string }, index: number) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      color: element.properties.textColor,
                      fontSize: element.properties.fontSize,
                      fontWeight: element.properties.fontWeight,
                    }}
                    className="mx-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {link.text}
                  </a>
                )
              )}
            </nav>
          </div>
        );
      case "navbar":
        return (
          <nav
            className="p-2"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            {element.properties.menuItems?.map(
              (item: { url: string; text: string }, index: number) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    color: element.properties.textColor,
                    fontSize: element.properties.fontSize,
                    fontWeight: element.properties.fontWeight,
                  }}
                  className="mx-4"
                  onClick={(e) => e.preventDefault()}
                >
                  {item.text}
                </a>
              )
            )}
          </nav>
        );
      case "jumbotron":
        return (
          <div
            className="text-center p-4"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            <h1 className="text-2xl font-bold">{element.properties.heading}</h1>
            <p className="mt-2">{element.properties.subtext}</p>
            <a
              href="#"
              className="mt-4 inline-block px-4 py-2 rounded"
              style={{ backgroundColor: "#007bff", color: "#fff" }}
              onClick={(e) => e.preventDefault()}
            >
              {element.properties.buttonText}
            </a>
          </div>
        );
      case "text":
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              onPropertiesChange(element.id, {
                content: e.currentTarget.textContent || "",
              })
            }
            className="w-full h-full p-2 overflow-auto"
            style={{
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            {element.properties.content}
          </div>
        );
      case "button":
        return (
          <button
            className="w-full h-full rounded"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            {element.properties.text}
          </button>
        );
      case "image":
        return (
          <img
            src={element.properties.imageUrl}
            alt="Image"
            className="w-full h-full object-cover"
          />
        );
      default:
        return <div>Unknown Element</div>;
    }
  };

  return (
    <div
      onClick={onSelect} // When the element is clicked, mark it as selected.
      ref={drag}
      className={`absolute border border-gray-600 bg-gray-800 select-none transition-all duration-150 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: isDragging ? 0.5 : 1,
        overflow: "hidden",
      }}
    >
      {renderContent()}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 cursor-se-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default DroppedElement;
