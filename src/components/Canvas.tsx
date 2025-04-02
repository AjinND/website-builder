"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import { throttle } from "lodash";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DroppedElement from "./DroppedElement";
import StyleEditor from "./StyleEditor";
import ElementPathBreadcrumb from "./ElementPathBreadcrumb";
import { getDefaultProperties } from "@/utils/defaultProperties";
import {
  generateIndexJs,
  generateIndexHtml,
  generateReactPackageJson,
  generateTailwindConfig,
  generatePostCssConfig,
  generateIndexCss,
  generateAppRouterJs,
  generateContainerElementJs,
  generateDivElementJs,
  generateCardElementJs,
} from "@/utils/codeGenerators";
import { CanvasProps, DroppedElementType } from "@/types/types";
import { getAbsolutePosition, getDepth } from "@/utils/calculateAbsolutePosition";

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

  useEffect(() => {
    const calculateScaleFactor = () => {
      if (!canvasContainerRef.current) return 1;

      const containerWidth = canvasContainerRef.current.clientWidth;
      const containerHeight = canvasContainerRef.current.clientHeight;

      const availableWidth = containerWidth - 40;
      const availableHeight = containerHeight - 40;

      const widthScale = availableWidth / device.width;
      const heightScale = availableHeight / (device.height + extraHeight);

      return Math.min(widthScale, heightScale, 1);
    };

    const handleResize = () => {
      setScaleFactor(calculateScaleFactor());
    };

    setScaleFactor(calculateScaleFactor());
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [device, extraHeight]);

  const [previousDevice, setPreviousDevice] = useState(device);

  useEffect(() => {
    if (previousDevice.width !== device.width && elements.length > 0) {
      const widthRatio = device.width / previousDevice.width;

      const responsiveElements = elements.map((el) => {
        const isFullWidthElement = ["header", "footer", "navbar", "divider"].includes(el.type);
        const newWidth = isFullWidthElement ? device.width * 0.95 : Math.round(el.width * widthRatio);
        const newX = isFullWidthElement ? (device.width - newWidth) / 2 : Math.round(el.x * widthRatio);

        return {
          ...el,
          width: newWidth,
          x: newX,
          y: Math.round(el.y * (device.height / previousDevice.height)),
        };
      });

      safeUpdateElements(responsiveElements);
    }

    setPreviousDevice(device);
  }, [device, elements]);

  const isContainer = useCallback((element: DroppedElementType) => {
    return element.properties.canHaveChildren === true;
  }, []);

  const safeUpdateElements = useCallback(
    (newElements: DroppedElementType[]) => {
      if (typeof updateElements === "function") {
        const elementsWithValidParents = newElements.map((el) => {
          if (el.parentId && !newElements.some((p) => p.id === el.parentId)) {
            return { ...el, parentId: null };
          }
          return el;
        });

        const constrainedElements = elementsWithValidParents.map((el) => {
          if (!el.parentId) {
            return {
              ...el,
              x: Math.max(0, Math.min(device.width - el.width, el.x)),
              y: Math.max(0, Math.min(device.height + extraHeight - el.height, el.y)),
            };
          } else {
            const parent = elementsWithValidParents.find((p) => p.id === el.parentId);
            if (parent) {
              const paddingStr = parent.properties.padding || "20px";
              let padding = 20;
              if (typeof paddingStr === "string") {
                const match = paddingStr.match(/^(\d+)(px|%)?$/);
                if (match) {
                  padding = match[2] === "%" ? (parseInt(match[1], 10) / 100) * parent.width : parseInt(match[1], 10);
                }
              } else if (typeof paddingStr === "number") {
                padding = paddingStr;
              }
              const innerWidth = parent.width - 2 * padding;
              const innerHeight = parent.height - 2 * padding;
              const newX = Math.max(padding, Math.min(innerWidth - el.width, el.x));
              const newY = Math.max(padding, Math.min(innerHeight - el.height, el.y));
              return { ...el, x: newX, y: newY };
            }
            return el;
          }
        });

        // const constrainedElements = elementsWithValidParents.map((el) => {
        //   if (!el.parentId) {
        //     return {
        //       ...el,
        //       x: Math.max(0, Math.min(device.width - el.width, el.x)),
        //       y: Math.max(0, Math.min(device.height + extraHeight - el.height, el.y)),
        //     };
        //   } else {
        //     const parent = elementsWithValidParents.find((p) => p.id === el.parentId);
        //     if (parent) {
        //       const newX = Math.max(0, Math.min(parent.width - el.width, el.x));
        //       const newY = Math.max(0, Math.min(parent.height - el.height, el.y));
        //       console.log(`Clamping child ${el.id} in parent ${parent.id}: x=${el.x} -> ${newX}, y=${el.y} -> ${newY}`);
        //       return { ...el, x: newX, y: newY };
        //     }
        //     return el;
        //   }
        // });

        const finalElements = constrainedElements.map((el) => {
          if (isContainer(el)) {
            const children = constrainedElements.filter((child) => child.parentId === el.id).map((child) => child.id);
            return { ...el, children };
          }
          return el;
        });

        console.log("Final elements after safeUpdateElements:", finalElements);
        updateElements(finalElements);
      }
    },
    [updateElements, device.width, device.height, extraHeight, isContainer]
  );

  const throttledUpdateElementsRef = useRef<Function | null>(null);

  useEffect(() => {
    throttledUpdateElementsRef.current = throttle(
      (newElements: DroppedElementType[]) => {
        safeUpdateElements([...newElements]);
      },
      30,
      { leading: true, trailing: true }
    );

    return () => {
      if (throttledUpdateElementsRef.current && "cancel" in throttledUpdateElementsRef.current) {
        (throttledUpdateElementsRef.current as any).cancel();
      }
    };
  }, [safeUpdateElements]);

  const throttledUpdateElements = useCallback((newElements: DroppedElementType[]) => {
    if (throttledUpdateElementsRef.current) {
      throttledUpdateElementsRef.current(newElements);
    }
  }, []);

  const findContainerAtPosition = useCallback(
    (x: number, y: number) => {
      let candidates: { el: DroppedElementType; depth: number }[] = [];

      elements.forEach((el) => {
        if (isContainer(el)) {
          const { absX, absY } = getAbsolutePosition(el, elements);
          const paddingStr = el.properties.padding || "20px";
          let padding = 20;

          if (typeof paddingStr === "string") {
            const match = paddingStr.match(/^(\d+)(px|%)?$/);
            if (match) {
              padding = match[2] === "%" ? (parseInt(match[1], 10) / 100) * el.width : parseInt(match[1], 10);
            }
          } else if (typeof paddingStr === "number") {
            padding = paddingStr;
          }

          // The bounding box should be the entire container area
          // We'll check if the point is inside the container
          const bbox = {
            left: absX,
            top: absY,
            right: absX + el.width,
            bottom: absY + el.height,
          };

          if (x >= bbox.left && x <= bbox.right && y >= bbox.top && y <= bbox.bottom) {
            const depth = getDepth(el, elements);
            candidates.push({ el, depth });
          }
        }
      });

      if (candidates.length === 0) return null;
      // Sort by depth to find the innermost container
      candidates.sort((a, b) => b.depth - a.depth);
      return candidates[0].el;
    },
    [elements, isContainer]
  );

  const deleteElement = useCallback(
    (id: number) => {
      const childIds = new Set<number>();
      const findAllChildren = (parentId: number) => {
        elements.forEach((el) => {
          if (el.parentId === parentId) {
            childIds.add(el.id);
            findAllChildren(el.id);
          }
        });
      };
      findAllChildren(id);

      const updatedElements = elements.filter((el) => el.id !== id && !childIds.has(el.id));
      throttledUpdateElements(updatedElements);
      setSelectedElementId(null);
    },
    [elements, throttledUpdateElements]
  );

  const duplicateElement = useCallback(
    (id: number) => {
      const elementToDuplicate = elements.find((el) => el.id === id);
      if (!elementToDuplicate) return;

      const newId = elements.length > 0 ? Math.max(...elements.map((el) => el.id)) + 1 : 1;
      const newElement = { ...elementToDuplicate, id: newId, x: elementToDuplicate.x + 20, y: elementToDuplicate.y + 20 };
      throttledUpdateElements([...elements, newElement]);
    },
    [elements, throttledUpdateElements]
  );

  const updateElementSize = useCallback(
    (id: number, width: number, height: number) => {
      const updatedElements = elements.map((el) => (el.id === id ? { ...el, width, height } : el));
      throttledUpdateElements(updatedElements);
    },
    [elements, throttledUpdateElements]
  );

  const updateElementProperties = useCallback(
    (id: number, newProperties: { [key: string]: any }) => {
      const updatedElements = elements.map((el) =>
        el.id === id ? { ...el, properties: { ...el.properties, ...newProperties } } : el
      );
      throttledUpdateElements(updatedElements);
    },
    [elements, throttledUpdateElements]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "element",
      drop: (item: { id?: number; type: string; parentId?: number }, monitor) => {
        const offset = monitor.getSourceClientOffset() || monitor.getClientOffset();
        if (!offset || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (offset.x - canvasRect.left) / scaleFactor;
        const y = (offset.y - canvasRect.top) / scaleFactor;

        const currentElements = [...elements];
        const containerElement = findContainerAtPosition(x, y);
        const parentId = containerElement ? containerElement.id : null;

        if (item.id !== undefined) {
          console.log(`Moving existing element ${item.id}`);
          let updatedElements = currentElements.map((el) => {
            if (el.id === item.id) {
              const movingElement = currentElements.find((e) => e.id === item.id);
              if (!movingElement) return el;

              let newX, newY;
              if (parentId && containerElement) {
                console.log(`Moving to container ${parentId}`);
                const { absX, absY } = getAbsolutePosition(containerElement, currentElements);
                console.log(`Container absolute position: x=${absX}, y=${absY}`);

                const paddingStr = containerElement.properties.padding || "20px";
                let padding = 20;
                if (typeof paddingStr === "string") {
                  const match = paddingStr.match(/^(\d+)(px|%)?$/);
                  if (match) {
                    padding = match[2] === "%" ? (parseInt(match[1], 10) / 100) * containerElement.width : parseInt(match[1], 10);
                  }
                } else if (typeof paddingStr === "number") {
                  padding = paddingStr;
                }

                // Calculate position relative to the container's content area
                // First, get the position relative to the container's top-left corner
                newX = x - absX - movingElement.width / 2;
                newY = y - absY - movingElement.height / 2;

                // Then, ensure the element stays within the container's content area
                // by applying padding constraints
                newX = Math.max(padding, Math.min(newX, containerElement.width - 2 * padding - movingElement.width));
                newY = Math.max(padding, Math.min(newY, containerElement.height - 2 * padding - movingElement.height));
                // newX = Math.max(padding, Math.min(newX, containerElement.width - movingElement.width - padding));
                // newY = Math.max(padding, Math.min(newY, containerElement.height - movingElement.height - padding));

                console.log(`Final relative position: x=${newX}, y=${newY}`);
              } else {
                newX = x - movingElement.width / 2;
                newY = y - movingElement.height / 2;
                console.log(`Top-level element position: x=${newX}, y=${newY}`);
              }

              return { ...el, x: newX, y: newY, parentId };
            }
            return el;
          });

          if (parentId) {
            updatedElements = updatedElements.map((el) => {
              if (el.id === parentId && item.id !== undefined) {
                const children = el.children || [];
                if (!children.includes(item.id)) {
                  return { ...el, children: [...children, item.id].filter((id): id is number => id !== undefined) };
                }
              }
              return el;
            });
          }

          if (item.parentId && item.parentId !== parentId) {
            updatedElements = updatedElements.map((el) => {
              if (el.id === item.parentId) {
                return { ...el, children: (el.children || []).filter((id) => id !== item.id) };
              }
              return el;
            });
          }

          throttledUpdateElements(updatedElements);
        } else {
          const newId = currentElements.length > 0 ? Math.max(...currentElements.map((el) => el.id)) + 1 : 1;
          let width = 100;
          let height = 50;

          if (["header", "navbar", "footer"].includes(item.type)) {
            width = device.width * 0.9;
            height = 60;
          } else if (item.type === "jumbotron") {
            width = device.width * 0.8;
            height = 200;
          } else if (item.type === "container") {
            width = 300;
            height = 200;
          } else if (item.type === "div") {
            width = 200;
            height = 150;
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
          let newX, newY;

          if (parentId && containerElement) {
            console.log(`Dropping inside container ${parentId}`);
            const { absX, absY } = getAbsolutePosition(containerElement, elements);
            console.log(`Container absolute position: x=${absX}, y=${absY}`);

            const paddingStr = containerElement.properties.padding || "20px";
            let padding = 20;
            if (typeof paddingStr === "string") {
              const match = paddingStr.match(/^(\d+)(px|%)?$/);
              if (match) {
                padding = match[2] === "%" ? (parseInt(match[1], 10) / 100) * containerElement.width : parseInt(match[1], 10);
              }
            } else if (typeof paddingStr === "number") {
              padding = paddingStr;
            }
            console.log(`Container padding: ${padding}px`);

            // Calculate position relative to the container's content area
            // First, get the position relative to the container's top-left corner
            newX = x - absX - width / 2;
            newY = y - absY - height / 2;
            console.log(`Initial relative position: x=${newX}, y=${newY}`);

            // Then, ensure the element stays within the container's content area
            // by applying padding constraints
            const maxX = containerElement.width - width - padding;
            const maxY = containerElement.height - height - padding;
            newX = Math.max(padding, Math.min(newX, maxX));
            newY = Math.max(padding, Math.min(newY, maxY));
            // newX = Math.max(padding, Math.min(newX, containerElement.width - 2 * padding - width));
            // newY = Math.max(padding, Math.min(newY, containerElement.height - 2 * padding - height));

            console.log(`Container bounds: maxX=${maxX}, maxY=${maxY}`);
            console.log({
              containerWidth: containerElement.width,
              containerHeight: containerElement.height,
              padding: padding,
              Width: width,
              Height: height,
              newX: newX,
              newY: newY
            });
            console.log(`Final relative position: x=${newX}, y=${newY}`);
          } else {
            newX = x - width / 2;
            newY = y - height / 2;
            console.log(`Top-level element position: x=${newX}, y=${newY}`);
          }

          const newElement = {
            id: newId,
            type: item.type,
            x: newX,
            y: newY,
            width,
            height,
            properties: defaultProperties,
            parentId,
            children: [],
          };
          console.log("New element created:", newElement);

          let newElements = [...currentElements, newElement];
          if (parentId) {
            newElements = newElements.map((el) => {
              if (el.id === parentId) {
                return { ...el, children: [...(el.children || []), newId] };
              }
              return el;
            });
          }
          console.log("Updated elements array:", newElements);

          throttledUpdateElements(newElements);
          setSelectedElementId(newId);
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [elements, throttledUpdateElements, findContainerAtPosition, device.width, scaleFactor]
  );

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      if (framework === "react") {
        const publicDir = zip.folder("public");
        publicDir?.file("index.html", generateIndexHtml());

        const srcDir = zip.folder("src");
        srcDir?.file("index.js", generateIndexJs());
        srcDir?.file("index.css", generateIndexCss());

        const componentsDir = srcDir?.folder("components");
        elements.forEach((element) => {
          if (element.type === "container") {
            componentsDir?.file("ContainerElement.js", generateContainerElementJs());
          } else if (element.type === "div") {
            componentsDir?.file("DivElement.js", generateDivElementJs());
          } else if (element.type === "card") {
            componentsDir?.file("CardElement.js", generateCardElementJs());
          }
        });

        zip.file("package.json", generateReactPackageJson());
        zip.file("tailwind.config.js", generateTailwindConfig());
        zip.file("postcss.config.js", generatePostCssConfig());
      } else if (framework === "next") {
        const appDir = zip.folder("app");
        appDir?.file("page.js", generateAppRouterJs(elements));
        appDir?.file(
          "layout.js",
          `
          export default function RootLayout({ children }) {
            return (
              <html lang="en">
                <body>{children}</body>
              </html>
            );
          }
        `
        );

        zip.file(
          "package.json",
          JSON.stringify(
            {
              name: "nextjs-website",
              version: "0.1.0",
              private: true,
              scripts: { dev: "next dev", build: "next build", start: "next start" },
              dependencies: { next: "^13.0.0", react: "^18.2.0", "react-dom": "^18.2.0" },
            },
            null,
            2
          )
        );
        zip.file("tailwind.config.js", generateTailwindConfig());
        zip.file("postcss.config.js", generatePostCssConfig());
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website-code.zip");
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectElement = useCallback((id: number) => {
    setSelectedElementId(id);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden relative">
        <div ref={canvasContainerRef} className="w-full h-full overflow-auto flex items-center justify-center p-4">
          <div
            className="relative transition-transform duration-300"
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
              onClick={() => setSelectedElementId(null)}
            >
              {elements.filter((el) => !el.parentId).map((el) => (
                <DroppedElement
                  key={`top-level-${el.id}`}
                  element={el}
                  allElements={elements}
                  onResize={updateElementSize}
                  onPropertiesChange={updateElementProperties}
                  onSelect={handleSelectElement}
                  selectedElementId={selectedElementId}
                  availablePages={allPages}
                />
              ))}
              <button
                onClick={generateCode}
                disabled={isGenerating}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded text-white ${
                  isGenerating ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
              isDarkTheme ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            + Add More Canvas Space
          </button>
        </div>
      </div>

      {selectedElement && (
        <div className={`style-editor-container p-6 ${isDarkTheme ? "bg-gray-800" : "bg-white border-t border-gray-700"}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
              Style Editor for {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className={`px-3 py-1 rounded text-sm ${
                  isDarkTheme ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
                title="Duplicate element"
              >
                Duplicate
              </button>
              <button
                onClick={() => setSelectedElementId(null)}
                className={`px-3 py-1 rounded text-sm ${
                  isDarkTheme ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                }`}
                title="Close editor"
              >
                Close
              </button>
            </div>
          </div>

          <ElementPathBreadcrumb
            elementId={selectedElement.id}
            allElements={elements}
            onSelectElement={handleSelectElement}
            isDarkTheme={isDarkTheme}
          />

          <StyleEditor
            properties={selectedElement.properties}
            onChange={(newStyles) => updateElementProperties(selectedElement.id, newStyles)}
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
              Element ID: {selectedElement.id} | Position: {selectedElement.x}x{selectedElement.y} | Size: {selectedElement.width}x
              {selectedElement.height}
              {selectedElement.parentId && ` | Parent: ${selectedElement.parentId}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}