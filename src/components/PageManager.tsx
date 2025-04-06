"use client";

import React, { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
const Canvas = dynamic(() => import("./Canvas"), { ssr: false });
import Toolbox from "./Toolbox";
import FrameworkSelector from "./FrameworkSelector";
import DeviceSelector from "./DeviceSelector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setPages,
  addPage,
  updatePage,
  deletePage,
  setCurrentPage,
} from "@/store/pageSlice";
import { setDarkTheme } from "@/store/themeSlice";
import { setElements } from "@/store/canvasSlice";
import { RootState } from "@/store/store";

export default function PageManager() {
  const dispatch = useAppDispatch();

  // Get state from Redux
  const { pages, currentPageId } = useAppSelector(
    (state: RootState) => state.pages
  );
  const { isDarkTheme } = useAppSelector((state: RootState) => state.theme);
  const { elements } = useAppSelector((state: RootState) => state.canvas);

  // Local state for framework and device
  const [framework, setFramework] = React.useState("React");
  const [device, setDevice] = React.useState({
    name: "Laptop (1366x768)",
    width: 1366,
    height: 768,
  });

  // Find the current page
  const currentPage =
    pages.find((page) => page.id === currentPageId) || pages[0];

  // Initialize Redux state if needed
  useEffect(() => {
    if (pages.length === 0) {
      dispatch(setPages([{ id: "page-1", name: "Home", elements: [] }]));
      dispatch(setCurrentPage("page-1"));
    }
  }, [dispatch, pages.length]);

  // Function to add a new page
  const addNewPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPage = {
      id: newPageId,
      name: `Page ${pages.length + 1}`,
      elements: [],
    };
    dispatch(addPage(newPage));
    dispatch(setCurrentPage(newPageId));
  };

  // Function to rename a page
  const renamePage = (id: string, newName: string) => {
    const pageToUpdate = pages.find((page) => page.id === id);
    if (pageToUpdate) {
      dispatch(
        updatePage({
          ...pageToUpdate,
          name: newName,
        })
      );
    }
  };

  // Function to delete a page
  const handleDeletePage = (id: string) => {
    if (!pages.find((page) => page.id === id)) {
      console.error("Page not found");
      return;
    }

    if (pages.length <= 1) return; // Don't delete the last page

    dispatch(deletePage(id));

    // If the current page is deleted, switch to the first page
    if (currentPageId === id) {
      const remainingPages = pages.filter((page) => page.id !== id);
      dispatch(setCurrentPage(remainingPages[0].id));
    }
  };

  // Function to duplicate a page
  const duplicatePage = (id: string) => {
    const pageToDuplicate = pages.find((page) => page.id === id);
    if (!pageToDuplicate) return;

    const newPageId = `page-${Date.now()}`;
    const newPage = {
      id: newPageId,
      name: `${pageToDuplicate.name} (Copy)`,
      elements: JSON.parse(JSON.stringify(pageToDuplicate.elements)), // Deep copy elements
    };

    dispatch(addPage(newPage));
    dispatch(setCurrentPage(newPageId));
  };

  // Function to update elements for the current page
  const updatePageElements = useCallback(
    (newElements: any[]) => {
      // Update Redux canvas state
      dispatch(setElements(newElements));

      // Update the current page's elements
      if (currentPage) {
        dispatch(
          updatePage({
            ...currentPage,
            elements: newElements,
          })
        );
      }
    },
    [dispatch, currentPage]
  );

  // Toggle theme
  const toggleTheme = () => {
    dispatch(setDarkTheme(!isDarkTheme));
  };

  return (
    <div
      className={`flex flex-col h-full ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div
        className={`flex justify-between items-center p-2 ${
          isDarkTheme ? "bg-gray-800" : "bg-white border-b border-gray-300"
        }`}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Website Builder</h1>
          <FrameworkSelector
            framework={framework}
            setFramework={setFramework}
            isDarkTheme={isDarkTheme}
          />
        </div>

        <div className="flex items-center space-x-4">
          <DeviceSelector
            device={device}
            setDevice={setDevice}
            isDarkTheme={isDarkTheme}
          />
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkTheme
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            title={
              isDarkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
            }
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
          <div
            className={`sticky top-0 z-30 flex overflow-x-auto ${
              isDarkTheme ? "bg-gray-800" : "bg-white border-b border-gray-300"
            }`}
          >
            {pages.map((page) => (
              <div
                key={page.id}
                className={`px-4 py-2 flex items-center ${
                  currentPageId === page.id
                    ? isDarkTheme
                      ? "bg-gray-700"
                      : "bg-blue-50 border-b-2 border-blue-500"
                    : isDarkTheme
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } mr-1`}
              >
                {currentPageId === page.id ? (
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => renamePage(page.id, e.target.value)}
                    className={`${
                      isDarkTheme
                        ? "bg-transparent border-b border-gray-500"
                        : "bg-blue-50 border-b border-blue-300"
                    } focus:outline-none`}
                  />
                ) : (
                  <span
                    onClick={() => dispatch(setCurrentPage(page.id))}
                    className="cursor-pointer"
                  >
                    {page.name}
                  </span>
                )}

                <div className="flex ml-2">
                  <button
                    onClick={() => duplicatePage(page.id)}
                    className={`mr-1 ${
                      isDarkTheme
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Duplicate page"
                  >
                    📋
                  </button>

                  {pages.length > 1 && (
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className={`${
                        isDarkTheme
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
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
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
