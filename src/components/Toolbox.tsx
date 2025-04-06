"use client";

import { CategoryProps, ToolboxItemProps, ToolboxProps } from "@/types/types";
import React, { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { createPortal } from "react-dom";

const ToolboxItem: React.FC<ToolboxItemProps> = ({
  type,
  children,
  description,
  icon,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "element",
    item: { type },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 my-2 bg-gray-700/50 backdrop-blur-sm rounded-lg cursor-move border border-gray-600/30 
        ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"} 
        hover:bg-gray-600/50 hover:border-gray-500/50 hover:scale-[1.02] 
        transition-all duration-200 ease-in-out shadow-sm`}
    >
      <div className="font-medium flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-sm">{children}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1.5">{description}</div>
    </div>
  );
};

const Category: React.FC<CategoryProps> = ({
  title,
  children,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between cursor-pointer py-2.5 border-b border-gray-700/50 hover:border-gray-600/50 transition-colors duration-200"
        onClick={onToggle}
      >
        <h4 className="text-sm font-semibold text-gray-200">{title}</h4>
        <span className="text-gray-400 transition-transform duration-200">
          {isOpen ? "▼" : "►"}
        </span>
      </div>
      <div
        className={`mt-2 transition-all duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default function Toolbox({ isDarkTheme = true }: ToolboxProps) {
  // Visibility and minimization state
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 175 });
  const [isDraggingToolbox, setIsDraggingToolbox] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dockPosition, setDockPosition] = useState<"left" | "right">("left");

  // Handlers for toggling visibility and minimization
  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setIsMinimized(false);
      }
      return !prev;
    });
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => !prev);
  };

  const toggleDockPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dockPosition === "left") {
      setDockPosition("right");
      setPosition({
        ...position,
        x: window.innerWidth - (toolboxRef.current?.offsetWidth || 300) - 20,
      });
    } else {
      setDockPosition("left");
      setPosition({ ...position, x: 20 });
    }
  };

  const toolboxRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [openCategories, setOpenCategories] = useState({
    layout: true,
    content: true,
    interactive: false,
    media: false,
  });

  const toggleCategory = (category: keyof typeof openCategories) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  // Handle toolbox dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingToolbox && headerRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        const maxX =
          window.innerWidth - (toolboxRef.current?.offsetWidth || 300);
        const maxY =
          window.innerHeight - (headerRef.current?.offsetHeight || 40);
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingToolbox(false);
    };

    if (isDraggingToolbox) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingToolbox, dragOffset]);

  useEffect(() => {
    setPosition({ x: 0, y: 175 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && toolboxRef.current) {
      setIsDraggingToolbox(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Vertical sticky toolbox toggle button
  const ToolboxToggleButton = () => (
    <div
      onClick={handleToggleOpen}
      className={`fixed z-50 shadow-lg flex items-center justify-center cursor-pointer 
        ${
          isDarkTheme
            ? "bg-gray-800/90 backdrop-blur-sm text-white hover:bg-gray-700/90"
            : "bg-white/90 text-gray-800 hover:bg-gray-100/90 border border-gray-300"
        } transition-all duration-200 hover:scale-105`}
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        [dockPosition]: "0",
        width: "40px",
        height: "120px",
        borderRadius: dockPosition === "left" ? "0 8px 8px 0" : "8px 0 0 8px",
      }}
      title={isOpen ? "Close Toolbox" : "Open Toolbox"}
    >
      <div
        className="vertical-text font-medium"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
        }}
      >
        Tool Box {isOpen ? "◀" : "▶"}
      </div>
    </div>
  );

  // Toolbox modal content
  const ToolboxModal = () => {
    if (!isOpen) return null;

    return (
      <div
        ref={toolboxRef}
        className={`fixed z-40 rounded-lg shadow-xl overflow-hidden transition-all duration-300 
          ${
            isDarkTheme
              ? "bg-gray-800/95 backdrop-blur-sm text-white"
              : "bg-white/95 text-gray-800 border border-gray-300"
          } ${isMinimized ? "w-16" : "w-72"}`}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transition: "width 0.3s ease-in-out, transform 0.3s ease-in-out",
        }}
      >
        {/* Toolbox header */}
        <div
          ref={headerRef}
          className={`p-3 ${isDarkTheme ? "bg-gray-700/50" : "bg-gray-100/50"} 
            flex ${
              isMinimized
                ? "flex-col items-center"
                : "justify-between items-center"
            } 
            cursor-move backdrop-blur-sm border-b border-gray-700/30`}
          onMouseDown={handleMouseDown}
        >
          <div
            className={`flex ${
              isMinimized ? "flex-col" : "items-center gap-2"
            }`}
          >
            <span className="text-lg">🧰</span>
            {!isMinimized && <h3 className="text-sm font-semibold">Toolbox</h3>}
          </div>
          <div
            className={`flex ${isMinimized ? "flex-col gap-1" : "space-x-1"}`}
          >
            <button
              aria-label="Toggle toolbox"
              onClick={toggleDockPosition}
              title={`Dock to ${dockPosition === "left" ? "right" : "left"}`}
              className={`p-1.5 rounded-md transition-colors duration-200
                ${
                  isDarkTheme ? "hover:bg-gray-600/50" : "hover:bg-gray-200/50"
                }`}
            >
              {dockPosition === "left" ? "⬅️" : "➡️"}
            </button>
            <button
              aria-label="Toggle toolbox"
              onClick={handleMinimize}
              title={isMinimized ? "Expand" : "Minimize"}
              className={`p-1.5 rounded-md transition-colors duration-200
                ${
                  isDarkTheme ? "hover:bg-gray-600/50" : "hover:bg-gray-200/50"
                }`}
            >
              {isMinimized ? "📋" : "➖"}
            </button>
          </div>
        </div>

        {/* Toolbox content */}
        {!isMinimized && (
          <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <p className="text-xs text-gray-400 mb-4 italic">
              Drag and drop elements onto the canvas to build your pages
            </p>

            <Category
              title="Layout Elements"
              isOpen={openCategories.layout}
              onToggle={() => toggleCategory("layout")}
            >
              <ToolboxItem
                type="header"
                description="Page header with logo and navigation links"
                icon="🔝"
              >
                Header
              </ToolboxItem>
              <ToolboxItem
                type="navbar"
                description="Navigation menu for your website"
                icon="🧭"
              >
                Navbar
              </ToolboxItem>
              <ToolboxItem
                type="jumbotron"
                description="Hero section with heading, text and call to action"
                icon="🏆"
              >
                Jumbotron
              </ToolboxItem>
              <ToolboxItem
                type="footer"
                description="Page footer with links and copyright information"
                icon="🔻"
              >
                Footer
              </ToolboxItem>
              <ToolboxItem
                type="divider"
                description="Horizontal divider to separate content sections"
                icon="➖"
              >
                Divider
              </ToolboxItem>
              <ToolboxItem
                type="container"
                description="Container to group and organize elements"
                icon="📦"
              >
                Container
              </ToolboxItem>
            </Category>

            <Category
              title="Content Elements"
              isOpen={openCategories.content}
              onToggle={() => toggleCategory("content")}
            >
              <ToolboxItem
                type="text"
                description="Simple text content"
                icon="📝"
              >
                Text
              </ToolboxItem>
              <ToolboxItem
                type="heading"
                description="Section heading with customizable size"
                icon="📌"
              >
                Heading
              </ToolboxItem>
              <ToolboxItem
                type="card"
                description="Card with title, content and optional image"
                icon="🃏"
              >
                Card
              </ToolboxItem>
              <ToolboxItem
                type="list"
                description="Ordered or unordered list of items"
                icon="📋"
              >
                List
              </ToolboxItem>
            </Category>

            <Category
              title="Interactive Elements"
              isOpen={openCategories.interactive}
              onToggle={() => toggleCategory("interactive")}
            >
              <ToolboxItem
                type="button"
                description="Clickable button with customizable action"
                icon="🔘"
              >
                Button
              </ToolboxItem>
              <ToolboxItem
                type="form"
                description="Input form with customizable fields"
                icon="📝"
              >
                Form
              </ToolboxItem>
              <ToolboxItem
                type="input"
                description="Text input field"
                icon="⌨️"
              >
                Input
              </ToolboxItem>
            </Category>

            <Category
              title="Media Elements"
              isOpen={openCategories.media}
              onToggle={() => toggleCategory("media")}
            >
              <ToolboxItem
                type="image"
                description="Image element with optional link"
                icon="🖼️"
              >
                Image
              </ToolboxItem>
              <ToolboxItem
                type="video"
                description="Embedded video player"
                icon="🎬"
              >
                Video
              </ToolboxItem>
              <ToolboxItem
                type="icon"
                description="Icon with customizable style"
                icon="⭐"
              >
                Icon
              </ToolboxItem>
            </Category>

            <div className="mt-6 pt-4 border-t border-gray-700/30">
              <h4 className="text-sm font-semibold mb-2 text-gray-200">
                Instructions
              </h4>
              <ol className="text-xs text-gray-400 list-decimal pl-4 space-y-1.5">
                <li>Drag elements to the canvas</li>
                <li>Click an element to edit it</li>
                <li>Add pages with the + button above</li>
                <li>Link elements to navigate between pages</li>
                <li>Generate code when ready</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Use createPortal to render the toolbox at the document body level
  // We need to handle client-side rendering properly to avoid hydration errors
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <ToolboxToggleButton />
      {isMounted && createPortal(<ToolboxModal />, document.body)}
    </>
  );
}
