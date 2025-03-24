"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { createPortal } from "react-dom";

interface ToolboxItemProps {
  type: string;
  children: React.ReactNode;
  description: string;
  icon?: string;
}

const ToolboxItem: React.FC<ToolboxItemProps> = ({ type, children, description, icon }) => {
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
      <div className="font-medium flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
  );
};

interface CategoryProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Category: React.FC<CategoryProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between cursor-pointer py-2 border-b border-gray-700"
        onClick={onToggle}
      >
        <h4 className="text-sm font-semibold">{title}</h4>
        <span>{isOpen ? '▼' : '►'}</span>
      </div>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

interface ToolboxProps {
  isDarkTheme?: boolean;
}

export default function Toolbox({ isDarkTheme = true }: ToolboxProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDraggingToolbox, setIsDraggingToolbox] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dockPosition, setDockPosition] = useState<'left' | 'right'>('left');

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

        // Keep toolbox within viewport
        const maxX = window.innerWidth - (toolboxRef.current?.offsetWidth || 300);
        const maxY = window.innerHeight - (headerRef.current?.offsetHeight || 40);

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
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbox, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && toolboxRef.current) {
      setIsDraggingToolbox(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const toggleDockPosition = () => {
    setDockPosition(dockPosition === 'left' ? 'right' : 'left');
    // Adjust position when changing dock
    if (dockPosition === 'left') {
      setPosition({ ...position, x: window.innerWidth - (toolboxRef.current?.offsetWidth || 300) - 20 });
    } else {
      setPosition({ ...position, x: 20 });
    }
  };

  // Toolbox toggle button that's always visible
  const ToolboxToggleButton = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed z-50 p-3 rounded-full shadow-lg ${
        isDarkTheme
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
      }`}
      style={{
        bottom: '20px',
        [dockPosition]: '20px',
      }}
    >
      {isOpen ? '🔧' : '🧰'}
    </button>
  );

  // Render the toolbox modal
  const ToolboxModal = () => {
    if (!isOpen) return null;

    return (
      <div
        ref={toolboxRef}
        className={`fixed z-40 rounded-lg shadow-xl overflow-hidden ${
          isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-300'
        } ${isMinimized ? 'w-auto' : 'w-64'}`}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          transition: isDraggingToolbox ? 'none' : 'all 0.2s ease',
        }}
      >
        {/* Toolbox header - draggable */}
        <div
          ref={headerRef}
          className={`p-2 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'} cursor-move flex justify-between items-center`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center">
            <span className="mr-2">🧰</span>
            {!isMinimized && <h3 className="text-sm font-semibold">Toolbox</h3>}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={toggleDockPosition}
              className={`p-1 rounded ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              title={`Dock to ${dockPosition === 'left' ? 'right' : 'left'}`}
            >
              {dockPosition === 'left' ? '⬅️' : '➡️'}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-1 rounded ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '📋' : '➖'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded ${isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
              title="Close"
            >
              ✖️
            </button>
          </div>
        </div>

        {/* Toolbox content */}
        {!isMinimized && (
          <div className="p-3 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-gray-400 mb-4">
              Drag and drop elements onto the canvas to build your pages
            </p>

            <Category
              title="Layout Elements"
              isOpen={openCategories.layout}
              onToggle={() => toggleCategory('layout')}
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
              onToggle={() => toggleCategory('content')}
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
              onToggle={() => toggleCategory('interactive')}
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
              onToggle={() => toggleCategory('media')}
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
      {isMounted && createPortal(
        <ToolboxModal />,
        document.body
      )}
    </>
  );
}