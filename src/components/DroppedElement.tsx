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
    content: string;
  };
  onResize: (id: number, width: number, height: number) => void;
  onContentChange: (id: number, content: string) => void;
}

const DroppedElement: React.FC<DroppedElementProps> = ({
  element,
  onResize,
  onContentChange,
}) => {
  // Make the element draggable
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "element",
    item: { id: element.id, type: element.type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Ref to track resizing state
  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // Start resizing on mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Update size during mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (resizeRef.current && resizeRef.current.isResizing) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const newWidth = resizeRef.current.startWidth + dx;
      const newHeight = resizeRef.current.startHeight + dy;
      onResize(element.id, newWidth, newHeight);
    }
  };

  // Stop resizing on mouse up
  const handleMouseUp = () => {
    if (resizeRef.current) {
      resizeRef.current.isResizing = false;
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={drag}
      className="absolute border border-gray-600 bg-gray-800 text-white select-none"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {element.type === "button" ? (
        <button className="w-full h-full bg-blue-600 text-white">
          {element.content}
        </button>
      ) : (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            onContentChange(element.id, e.currentTarget.textContent || "")
          }
          className="w-full p-2"
        >
          {element.content}
        </div>
      )}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 cursor-se-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default DroppedElement;
