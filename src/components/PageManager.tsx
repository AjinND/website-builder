"use client";

import React, { useCallback, useEffect, useState } from "react";
import Canvas from "./Canvas";
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
    name: "Desktop (1920x1080)",
    width: 1920,
    height: 1080,
  });

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

  useEffect(() => {
    console.log("Pages state updated:", pages);
  }, [pages]);
  // Function to update elements for the current page
  const updatePageElements = useCallback((elements: any[]) => {
    console.log("New elements:", elements);
    setPages(
      pages.map((page) =>
        page.id === currentPageId ? { ...page, elements } : page
      )
    );
  }, [pages, currentPageId]);
  
  console.log("Elements passed to Canvas::", currentPage.elements);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex">
        <FrameworkSelector framework={framework} setFramework={setFramework} />
        <DeviceSelector device={device} setDevice={setDevice} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Toolbox />

        <div className="flex-1 flex flex-col">
          {/* Page tabs */}
          <div className="flex bg-gray-900 text-white overflow-x-auto">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`px-4 py-2 flex items-center ${
                  currentPageId === page.id ? "bg-gray-700" : "bg-gray-800"
                } mr-1`}
              >
                {currentPageId === page.id ? (
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => renamePage(page.id, e.target.value)}
                    className="bg-transparent border-b border-gray-500 focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => setCurrentPageId(page.id)}
                    className="cursor-pointer"
                  >
                    {page.name}
                  </span>
                )}

                {pages.length > 1 && (
                  <button
                    onClick={() => deletePage(page.id)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addNewPage}
              className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700"
            >
              +
            </button>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-900 overflow-auto">
            <Canvas
              framework={framework}
              device={device}
              elements={currentPage.elements}
              updateElements={updatePageElements}
              allPages={pages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
