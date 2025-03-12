"use client";

import React from "react";
import { useDrag } from "react-dnd";

interface ToolboxItemProps {
  type: string;
  children: React.ReactNode;
}

const ToolboxItem: React.FC<ToolboxItemProps> = ({ type, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "element",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        margin: "10px 0",
      }}
    >
      {children}
    </div>
  );
};

export default function Toolbox() {
  return (
    <div className="w-48 border-r border-gray-700 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-4">Toolbox</h3>
      <ToolboxItem type="header">Header</ToolboxItem>
      <ToolboxItem type="navbar">Navbar</ToolboxItem>
      <ToolboxItem type="jumbotron">Jumbotron</ToolboxItem>
      <ToolboxItem type="text">Text</ToolboxItem>
      <ToolboxItem type="button">Button</ToolboxItem>
      <ToolboxItem type="image">Image</ToolboxItem>
    </div>
  );
}
