"use client";

import React from "react";
import { useDrag } from "react-dnd";

interface ToolboxItemProps {
  type: string;
  children: React.ReactNode;
  description: string;
}

const ToolboxItem: React.FC<ToolboxItemProps> = ({ type, children, description }) => {
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
      className={`p-2 my-2 bg-gray-700 rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      } hover:bg-gray-600 transition-all duration-150`}
    >
      <div className="font-medium">{children}</div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  );
};

export default function Toolbox() {
  return (
    <div className="w-48 border-r border-gray-700 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-4">Toolbox</h3>
      <p className="text-xs text-gray-400 mb-4">
        Drag and drop elements onto the canvas to build your pages
      </p>
      
      <ToolboxItem 
        type="header" 
        description="Page header with logo and navigation links"
      >
        Header
      </ToolboxItem>
      
      <ToolboxItem 
        type="navbar" 
        description="Navigation menu for your website"
      >
        Navbar
      </ToolboxItem>
      
      <ToolboxItem 
        type="jumbotron" 
        description="Hero section with heading, text and call to action"
      >
        Jumbotron
      </ToolboxItem>
      
      <ToolboxItem 
        type="text" 
        description="Simple text content"
      >
        Text
      </ToolboxItem>
      
      <ToolboxItem 
        type="button" 
        description="Clickable button with customizable action"
      >
        Button
      </ToolboxItem>
      
      <ToolboxItem 
        type="image" 
        description="Image element with optional link"
      >
        Image
      </ToolboxItem>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-semibold mb-2">Instructions</h4>
        <ol className="text-xs text-gray-400 list-decimal pl-4 space-y-1">
          <li>Drag elements to the canvas</li>
          <li>Click an element to edit it</li>
          <li>Add pages with the + button above</li>
          <li>Link elements to navigate between pages</li>
          <li>Generate code when ready</li>
        </ol>
      </div>
    </div>
  );
}