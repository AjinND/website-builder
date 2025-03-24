"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DroppedElement from "./DroppedElement";
import StyleEditor from "./StyleEditor";
import { getDefaultProperties } from "@/utils/defaultProperties";
import {
  generateIndexJs,
  generateIndexHtml,
  generateReactPackageJson,
  generateTailwindConfig,
  generatePostCssConfig,
  generateIndexCss,
  generateAppRouterJs,
} from "@/utils/codeGenerators";
import { CanvasProps, DroppedElementType } from "@/types/types";

export default function Canvas({
  framework,
  device,
  elements = [],
  updateElements,
  allPages,
  isDarkTheme = true,
}: CanvasProps) {
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
  const [extraHeight, setExtraHeight] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isResponsivePreview, setIsResponsivePreview] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Calculate scale factor based on available space
  useEffect(() => {
    const calculateScaleFactor = () => {
      if (!canvasContainerRef.current) return 1;

      const containerWidth = canvasContainerRef.current.clientWidth;
      const containerHeight = canvasContainerRef.current.clientHeight;

      // Add some padding
      const availableWidth = containerWidth - 40;
      const availableHeight = containerHeight - 40;

      // Calculate scale factors for width and height
      const widthScale = availableWidth / device.width;
      const heightScale = availableHeight / (device.height + extraHeight);

      // Use the smaller scale factor to ensure the canvas fits
      return Math.min(widthScale, heightScale, 1);
    };

    const handleResize = () => {
      setScaleFactor(calculateScaleFactor());
    };

    setScaleFactor(calculateScaleFactor());
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [device, extraHeight]);

  // Track previous device for responsive adjustments
  const [previousDevice, setPreviousDevice] = useState(device);

  // Apply responsive adjustments when device changes
  useEffect(() => {
    if (previousDevice.width !== device.width && elements.length > 0) {
      // Calculate scale factor between previous and current device
      const widthRatio = device.width / previousDevice.width;

      // Adjust element positions and sizes proportionally
      const responsiveElements = elements.map(el => {
        // For full-width elements like headers, footers, and navbars
        const isFullWidthElement = ['header', 'footer', 'navbar', 'divider'].includes(el.type);

        // Calculate new width - full width for certain elements
        const newWidth = isFullWidthElement
          ? device.width * 0.95 // 95% of device width
          : Math.round(el.width * widthRatio);

        // Calculate new x position - centered for full width elements
        const newX = isFullWidthElement
          ? (device.width - newWidth) / 2 // Center horizontally
          : Math.round(el.x * widthRatio);

        return {
          ...el,
          width: newWidth,
          x: newX,
          // Keep y position proportional
          y: Math.round(el.y * (device.height / previousDevice.height))
        };
      });

      safeUpdateElements(responsiveElements);
    }

    setPreviousDevice(device);
  }, [device, elements]);

  const safeUpdateElements = (newElements: DroppedElementType[]) => {
    if (typeof updateElements === "function") {
      updateElements(
        newElements.map((el) => ({
          ...el,
          x: Math.max(0, Math.min(device.width - el.width, el.x)),
          y: Math.max(0, Math.min(device.height + extraHeight - el.height, el.y)),
        }))
      );
    }
  };

  const deleteElement = (id: number) => {
    const updatedElements = elements.filter((el) => el.id !== id);
    safeUpdateElements(updatedElements);
    setSelectedElementId(null);
  };

  const duplicateElement = (id: number) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) return;

    const newId = elements.length > 0 ? Math.max(...elements.map((el) => el.id)) + 1 : 1;
    const newElement = {
      ...elementToDuplicate,
      id: newId,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20,
    };

    safeUpdateElements([...elements, newElement]);
  };

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "element",
      drop: (item: { id?: number; type: string }, monitor) => {
        const offset = monitor.getSourceClientOffset() || monitor.getClientOffset();
        if (!offset || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        // Adjust for scale factor
        const x = (offset.x - canvasRect.left) / scaleFactor;
        const y = (offset.y - canvasRect.top) / scaleFactor;

        if (item.id !== undefined) {
          const updatedElements = elements.map((el) =>
            el.id === item.id ? { ...el, x, y } : el
          );
          safeUpdateElements(updatedElements);
        } else {
          const newId = elements.length > 0 ? Math.max(...elements.map((el) => el.id)) + 1 : 1;

          // Set default width and height based on element type
          let width = 100;
          let height = 50;

          if (["header", "navbar", "footer"].includes(item.type)) {
            width = device.width * 0.9; // 90% of device width
            height = 60;
          } else if (item.type === "jumbotron") {
            width = device.width * 0.8; // 80% of device width
            height = 200;
          } else if (item.type === "container") {
            width = 300;
            height = 200;
          } else if (item.type === "card") {
            width = 250;
            height = 300;
          } else if (item.type === "form") {
            width = 300;
            height = 350;
          } else if (item.type === "divider") {
            width = device.width * 0.8;
            height = 20;
          } else if (item.type === "video") {
            width = 320;
            height = 240;
          } else if (item.type === "icon") {
            width = 50;
            height = 50;
          }

          const defaultProperties = getDefaultProperties(item.type);
          const newElements = [
            ...elements,
            { id: newId, type: item.type, x: x - width / 2, y: y - height / 2, width, height, properties: defaultProperties },
          ];
          safeUpdateElements(newElements);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [elements, device, extraHeight, updateElements, scaleFactor]
  );

  const updateElementSize = (id: number, width: number, height: number) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, width, height } : el
    );
    safeUpdateElements(updatedElements);
  };

  const updateElementProperties = (id: number, newProperties: { [key: string]: any }) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, properties: { ...el.properties, ...newProperties } } : el
    );
    safeUpdateElements(updatedElements);
  };

  const serializePageData = (page: typeof allPages[0]) => {
    return {
      components: page.elements.map((el) => ({
        id: el.id,
        type: el.type,
        position: { x: el.x, y: el.y },
        size: { width: el.width, height: el.height },
        styles: el.properties,
      })),
    };
  };

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const generatedPages = await Promise.all(
        allPages.map(async (page) => {
          const jsonData = serializePageData(page);
          console.log("JSON Data ---> ", jsonData.components);
          const response = await fetch('/api/generate-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jsonData }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate code for page: ${page.name}`);
          }

          const data = await response.json();
          console.log("Generated Data ---> ", data.generatedCode);
          return { name: page.name, code: data.generatedCode };
        })
      );

      const zip = new JSZip();

      // Add boilerplate files
      zip.file("src/index.js", generateIndexJs());
      zip.file("src/index.css", generateIndexCss());
      zip.file("public/index.html", generateIndexHtml());
      zip.file("tailwind.config.js", generateTailwindConfig());
      zip.file("postcss.config.js", generatePostCssConfig());
      zip.file("package.json", generateReactPackageJson());

      // Add router setup
      zip.file("src/AppRouter.js", generateAppRouterJs(allPages));

      // Add AI-generated page files
      const pagesFolder = zip.folder("src/pages");
      generatedPages.forEach(({ name, code }) => {
        const fileName = `${name.replace(/\s+/g, "").toLowerCase()}.js`;
        pagesFolder?.file(fileName, code);
      });

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "my-react-app.zip");
    } catch (error) {
      console.error("Error generating code:", error);
      alert("Failed to generate code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className={`flex flex-col min-h-full ${isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <div className="p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setIsResponsivePreview(!isResponsivePreview)}
            className={`px-3 py-1 rounded text-sm ${
              isDarkTheme
                ? (isResponsivePreview ? "bg-blue-600 text-white" : "bg-gray-700 text-white")
                : (isResponsivePreview ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800")
            }`}
          >
            {isResponsivePreview ? "Fixed Scale" : "Responsive Preview"}
          </button>
        </div>
        <div className="text-sm">
          Scale: {Math.round(scaleFactor * 100)}% | Device: {device.name}
        </div>
      </div>

      {/* Make the entire content area scrollable */}
      <div className="flex-1 overflow-visible pb-20">
        <div ref={canvasContainerRef} className="flex justify-center">
          <div
            style={{
              transform: isResponsivePreview ? `scale(${scaleFactor})` : "none",
              transformOrigin: "top center",
              transition: "transform 0.3s ease",
            }}
          >
            <div
              ref={(node) => {
                drop(node);
                canvasRef.current = node;
              }}
              className={`relative mx-auto border ${
                isDarkTheme
                  ? `border-gray-600 ${isOver ? "bg-gray-700" : "bg-gray-800"}`
                  : `border-gray-300 ${isOver ? "bg-gray-200" : "bg-white"}`
              }`}
              style={{
                width: device.width,
                minHeight: device.height + extraHeight,
                backgroundImage: isDarkTheme
                  ? "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.05) 20px)"
                  : "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.05) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,0,0,0.05) 20px)",
              }}
            >
              {elements.map((el) => (
                <DroppedElement
                  key={el.id}
                  element={el}
                  onResize={updateElementSize}
                  onPropertiesChange={updateElementProperties}
                  onSelect={() => setSelectedElementId(el.id)}
                  isSelected={el.id === selectedElementId}
                  availablePages={allPages}
                />
              ))}
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded text-white ${
                  isGenerating
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isGenerating ? "Generating..." : "Generate Code"}
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-0 right-0 flex justify-center space-x-4 z-30">
          <button
            onClick={() => setExtraHeight(extraHeight + 300)}
            className={`px-4 py-2 rounded shadow-lg ${
              isDarkTheme
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            + Add More Canvas Space
          </button>
        </div>

      </div>

        {selectedElement && (
          <div
            className={`style-editor-container p-6 ${
              isDarkTheme ? "bg-gray-800" : "bg-white border border-gray-300"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${
                  isDarkTheme ? "text-white" : "text-gray-800"
                }`}
              >
                Style Editor for{" "}
                {selectedElement.type.charAt(0).toUpperCase() +
                  selectedElement.type.slice(1)}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    isDarkTheme
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                  title="Duplicate element"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => setSelectedElementId(null)}
                  className={`px-3 py-1 rounded text-sm ${
                    isDarkTheme
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                  title="Close editor"
                >
                  Close
                </button>
              </div>
            </div>

            <StyleEditor
              properties={selectedElement.properties}
              onChange={(newStyles) =>
                updateElementProperties(selectedElement.id, newStyles)
              }
              elementType={selectedElement.type}
              availablePages={allPages}
              isDarkTheme={isDarkTheme}
            />

            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between">
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Element
              </button>
              <div className="text-xs text-gray-500">
                Element ID: {selectedElement.id} | Position: {selectedElement.x}
                x{selectedElement.y} | Size: {selectedElement.width}x
                {selectedElement.height}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}