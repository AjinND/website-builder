"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from 'next/dynamic';
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import Toolbox from "./Toolbox";
import FrameworkSelector from "./FrameworkSelector";
import DeviceSelector from "./DeviceSelector";

interface Page {
  id: string;
  name: string;
  elements: any[];
}

export default function PageManager() {
  const [framework, setFramework] = useState("React");
  const [device, setDevice] = useState({
    name: "Desktop Large (1920x1080)",
    width: 1920,
    height: 1080,
  });
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // State for managing multiple pages
  const [pages, setPages] = useState<Page[]>([
    { id: "page-1", name: "Home", elements: [] },
  ]);
  const [currentPageId, setCurrentPageId] = useState("page-1");

  // Find the current page
  const currentPage =
    pages.find((page) => page.id === currentPageId) || pages[0];

  // Function to add a new page
  const addNewPage = () => {
    const newPageId = `page-${pages.length + 1}`;
    const newPage = {
      id: newPageId,
      name: `Page ${pages.length + 1}`,
      elements: [],
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPageId);
  };

  // Function to rename a page
  const renamePage = (id: string, newName: string) => {
    setPages(
      pages.map((page) => (page.id === id ? { ...page, name: newName } : page))
    );
  };

  // Function to delete a page
  const deletePage = (id: string) => {
    if (pages.length <= 1) return; // Don't delete the last page

    const newPages = pages.filter((page) => page.id !== id);
    setPages(newPages);

    // If the current page is deleted, switch to the first page
    if (currentPageId === id) {
      setCurrentPageId(newPages[0].id);
    }
  };

  // Function to duplicate a page
  const duplicatePage = (id: string) => {
    const pageToDuplicate = pages.find(page => page.id === id);
    if (!pageToDuplicate) return;

    const newPageId = `page-${Date.now()}`;
    const newPage = {
      id: newPageId,
      name: `${pageToDuplicate.name} (Copy)`,
      elements: JSON.parse(JSON.stringify(pageToDuplicate.elements)), // Deep copy elements
    };

    setPages([...pages, newPage]);
    setCurrentPageId(newPageId);
  };

  // Function to update elements for the current page
  const updatePageElements = useCallback((elements: any[]) => {
    setPages(
      pages.map((page) =>
        page.id === currentPageId ? { ...page, elements } : page
      )
    );
  }, [pages, currentPageId]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`flex flex-col h-full ${isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <div className={`flex justify-between items-center p-2 ${isDarkTheme ? "bg-gray-800" : "bg-white border-b border-gray-300"}`}>
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Website Builder</h1>
          <FrameworkSelector framework={framework} setFramework={setFramework} isDarkTheme={isDarkTheme} />
        </div>

        <div className="flex items-center space-x-4">
          <DeviceSelector device={device} setDevice={setDevice} isDarkTheme={isDarkTheme} />
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
            }`}
            title={isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDarkTheme ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Floating toolbox */}
        <Toolbox isDarkTheme={isDarkTheme} />

        <div className="flex-1 flex flex-col">
          {/* Page tabs - sticky */}
          <div className={`sticky top-0 z-10 flex overflow-x-auto ${isDarkTheme ? "bg-gray-800" : "bg-white border-b border-gray-300"}`}>
            {pages.map((page) => (
              <div
                key={page.id}
                className={`px-4 py-2 flex items-center ${
                  currentPageId === page.id
                    ? (isDarkTheme ? "bg-gray-700" : "bg-blue-50 border-b-2 border-blue-500")
                    : (isDarkTheme ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50")
                } mr-1`}
              >
                {currentPageId === page.id ? (
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => renamePage(page.id, e.target.value)}
                    className={`${isDarkTheme ? "bg-transparent border-b border-gray-500" : "bg-blue-50 border-b border-blue-300"} focus:outline-none`}
                  />
                ) : (
                  <span
                    onClick={() => setCurrentPageId(page.id)}
                    className="cursor-pointer"
                  >
                    {page.name}
                  </span>
                )}

                <div className="flex ml-2">
                  <button
                    onClick={() => duplicatePage(page.id)}
                    className={`mr-1 ${isDarkTheme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                    title="Duplicate page"
                  >
                    📋
                  </button>

                  {pages.length > 1 && (
                    <button
                      onClick={() => deletePage(page.id)}
                      className={`${isDarkTheme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                      title="Delete page"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addNewPage}
              className={`px-4 py-2 ${
                isDarkTheme
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              title="Add new page"
            >
              +
            </button>
          </div>

          {/* Canvas - ensure it's scrollable */}
          <div className="flex-1 overflow-auto">
            <Canvas
              framework={framework}
              device={device}
              elements={currentPage.elements}
              updateElements={updatePageElements}
              allPages={pages}
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
