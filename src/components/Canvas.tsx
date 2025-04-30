"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
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
import { generateCodeWithAI } from "@/utils/openaiApi";
import { DroppedElementType, CanvasProps, AIModelProvider } from "@/types/types";
import {
  getAbsolutePosition,
  getDepth,
} from "@/utils/calculateAbsolutePosition";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setElements,
  setSelectedElement,
  setScaleFactor,
  setResponsivePreview,
  setExtraHeight,
  setIsGenerating,
  addElement,
} from "@/store/canvasSlice";
import { RootState } from "@/store/store";
import { CanvasState } from "@/store/canvasSlice";

// Using CanvasProps from types.ts

export default function Canvas({
  framework,
  device,
  isDarkTheme = true,
}: CanvasProps) {
  const dispatch = useAppDispatch();
  const {
    elements,
    selectedElementId,
    extraHeight,
    isGenerating,
    scaleFactor,
    isResponsivePreview,
  } = useAppSelector((state: RootState) => state.canvas as CanvasState);

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

    const handleResize = throttle(() => {
      dispatch(setScaleFactor(calculateScaleFactor()));
    }, 100);

    dispatch(setScaleFactor(calculateScaleFactor()));
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [device, extraHeight, dispatch]);

  const [previousDevice, setPreviousDevice] = React.useState(device);

  useEffect(() => {
    if (previousDevice.width !== device.width && elements.length > 0) {
      const widthRatio = device.width / previousDevice.width;

      const responsiveElements = elements.map((el: DroppedElementType) => {
        const isFullWidthElement = [
          "header",
          "footer",
          "navbar",
          "divider",
        ].includes(el.type);
        const newWidth = isFullWidthElement
          ? device.width * 0.95
          : Math.round(el.width * widthRatio);
        const newX = isFullWidthElement
          ? (device.width - newWidth) / 2
          : Math.round(el.x * widthRatio);

        return {
          ...el,
          width: newWidth,
          x: newX,
          y: Math.round(el.y * (device.height / previousDevice.height)),
        };
      });

      dispatch(setElements(responsiveElements));
    }

    setPreviousDevice(device);
  }, [device, elements, dispatch]);

  const isContainer = useCallback((element: DroppedElementType) => {
    return element.properties.canHaveChildren === true;
  }, []);

  const safeUpdateElements = useCallback(
    (newElements: DroppedElementType[]) => {
      // Create a deep copy of the elements array
      const elementsCopy = JSON.parse(JSON.stringify(newElements));

      // First, ensure all elements have valid parent references
      const elementsWithValidParents = elementsCopy.map(
        (el: DroppedElementType) => {
          if (
            el.parentId &&
            !elementsCopy.some((p: DroppedElementType) => p.id === el.parentId)
          ) {
            return { ...el, parentId: null };
          }
          return el;
        }
      );

      // Then, constrain elements to their parent boundaries
      const constrainedElements = elementsWithValidParents.map(
        (el: DroppedElementType) => {
          if (!el.parentId) {
            // Elements directly on the canvas
            return {
              ...el,
              x: Math.max(0, Math.min(device.width - el.width, el.x)),
              y: Math.max(
                0,
                Math.min(device.height + extraHeight - el.height, el.y)
              ),
            };
          } else {
            // Elements inside containers
            const parent = elementsWithValidParents.find(
              (p: DroppedElementType) => p.id === el.parentId
            );
            if (parent) {
              const paddingStr = parent.properties.padding || "20px";
              let padding = 20;
              if (typeof paddingStr === "string") {
                const match = paddingStr.match(/^(\d+)(px|%)?$/);
                if (match) {
                  const paddingValue = parseInt(match[1], 10);
                  padding =
                    match[2] === "%"
                      ? (paddingValue / 100) * parent.width
                      : paddingValue;
                }
              } else if (typeof paddingStr === "number") {
                padding = paddingStr;
              }

              const innerWidth = parent.width - 2 * padding;
              const innerHeight = parent.height - 2 * padding;

              // Calculate relative position within parent
              const relativeX = Math.max(
                padding,
                Math.min(innerWidth - el.width, el.x)
              );
              const relativeY = Math.max(
                padding,
                Math.min(innerHeight - el.height, el.y)
              );

              return {
                ...el,
                x: relativeX,
                y: relativeY,
              };
            }
            return el;
          }
        }
      );

      // Update children arrays for container elements
      const finalElements = constrainedElements.map(
        (el: DroppedElementType) => {
          if (isContainer(el)) {
            const children = constrainedElements
              .filter((child: DroppedElementType) => child.parentId === el.id)
              .map((child: DroppedElementType) => child.id);
            return { ...el, children };
          }
          return el;
        }
      );

      dispatch(setElements(finalElements));
    },
    [dispatch, device.width, device.height, extraHeight, isContainer]
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
      if (
        throttledUpdateElementsRef.current &&
        "cancel" in throttledUpdateElementsRef.current
      ) {
        (throttledUpdateElementsRef.current as any).cancel();
      }
    };
  }, [safeUpdateElements]);

  const throttledUpdateElements = useCallback(
    (newElements: DroppedElementType[]) => {
      const elementsCopy = JSON.parse(JSON.stringify(newElements));
      if (throttledUpdateElementsRef.current) {
        throttledUpdateElementsRef.current(elementsCopy);
      }
    },
    []
  );

  useEffect(() => {
    throttledUpdateElementsRef.current = throttle(
      (newElements: DroppedElementType[]) => {
        dispatch((_, getState) => {
          const { canvas } = getState();
          const updatedElements = [
            ...canvas.elements.filter(
              (el) => !newElements.some((ne) => ne.id === el.id)
            ),
            ...newElements,
          ];
          safeUpdateElements(updatedElements);
          return setElements(updatedElements);
        });
      },
      30,
      { leading: true, trailing: true }
    );
  }, [dispatch, safeUpdateElements]);

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
              padding =
                match[2] === "%"
                  ? (parseInt(match[1], 10) / 100) * el.width
                  : parseInt(match[1], 10);
            }
          } else if (typeof paddingStr === "number") {
            padding = paddingStr;
          }

          // Calculate the inner bounds of the container (accounting for padding)
          const innerLeft = absX + padding;
          const innerTop = absY + padding;
          const innerRight = absX + el.width - padding;
          const innerBottom = absY + el.height - padding;

          // Check if the drop position is within the inner bounds of the container
          if (
            x >= innerLeft &&
            x <= innerRight &&
            y >= innerTop &&
            y <= innerBottom
          ) {
            const depth = getDepth(el, elements);
            candidates.push({ el, depth });
          }
        }
      });

      if (candidates.length === 0) return null;
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
      const newElements = elements.filter(
        (el) => el.id !== id && !childIds.has(el.id)
      );
      dispatch(setElements(newElements));
      if (selectedElementId === id) {
        dispatch(setSelectedElement(null));
      }
    },
    [elements, selectedElementId, dispatch]
  );

  const calculateScaleFactor = useCallback(() => {
    if (!canvasContainerRef.current) return 1;

    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;

    const availableWidth = containerWidth - 40;
    const availableHeight = containerHeight - 40;

    const widthScale = availableWidth / device.width;
    const heightScale = availableHeight / (device.height + extraHeight);

    return Math.min(widthScale, heightScale, 1);
  }, [device.width, device.height, extraHeight]);

  const [, drop] = useDrop(
    () => ({
      accept: "element",
      drop: (item: any, monitor) => {
        const offset = monitor.getClientOffset();
        if (!offset || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const currentScaleFactor = calculateScaleFactor();

        // Calculate the drop position relative to the canvas
        const x = (offset.x - canvasRect.left) / currentScaleFactor;
        const y = (offset.y - canvasRect.top) / currentScaleFactor;

        // Find the potential parent container at the drop position
        const potentialParent = elements
          .filter((el) => el.properties.canHaveChildren)
          .find((el) => {
            const elementRect = {
              left: el.x,
              top: el.y,
              right: el.x + el.width,
              bottom: el.y + el.height,
            };
            return (
              x >= elementRect.left &&
              x <= elementRect.right &&
              y >= elementRect.top &&
              y <= elementRect.bottom
            );
          });

        // Get default properties for the element type
        const defaultProps = getDefaultProperties(item.type);

        // Create the new element
        const newElement: DroppedElementType = {
          id: Date.now(),
          type: item.type,
          x: potentialParent ? x - potentialParent.x : x,
          y: potentialParent ? y - potentialParent.y : y,
          // width: getDefaultProperties(item.type).width || 100,
          // height: getDefaultProperties(item.type).height || 100,
          width:
            typeof defaultProps.width === "number" ? defaultProps.width : 100,
          height:
            typeof defaultProps.height === "number" ? defaultProps.height : 100,
          properties: defaultProps,
          parentId: potentialParent ? potentialParent.id : null,
        };

        // Update the elements array with the new element
        const updatedElements = [...elements, newElement];

        // If there's a parent, update its children array
        if (potentialParent) {
          const parentIndex = updatedElements.findIndex(
            (el) => el.id === potentialParent.id
          );
          if (parentIndex !== -1) {
            updatedElements[parentIndex] = {
              ...updatedElements[parentIndex],
              children: [
                ...(updatedElements[parentIndex].children || []),
                newElement.id,
              ],
            };
          }
        }

        // Apply constraints and update the state
        safeUpdateElements(updatedElements);
      },
    }),
    [elements, calculateScaleFactor, safeUpdateElements]
  );

  // State for AI model selection
  const [selectedAIModel, setSelectedAIModel] = useState<AIModelProvider>(AIModelProvider.GEMINI);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);
  const [showAIModelSelector, setShowAIModelSelector] = useState<boolean>(false);

  // Function to toggle AI model selector
  const toggleAIModelSelector = () => {
    setShowAIModelSelector(!showAIModelSelector);
  };

  // Function to select AI model
  const selectAIModel = (model: AIModelProvider) => {
    setSelectedAIModel(model);
    setShowAIModelSelector(false);
  };

  // Function to generate code using traditional method
  // const generateCodeTraditional = async () => {
  //   try {
  //     const zip = new JSZip();

  //     // Add common files
  //     zip.file("index.html", generateIndexHtml());
  //     zip.file("package.json", generateReactPackageJson());
  //     zip.file("tailwind.config.js", generateTailwindConfig());
  //     zip.file("postcss.config.js", generatePostCssConfig());
  //     zip.file("src/index.css", generateIndexCss());

  //     // Add framework-specific files
  //     if (framework === "React") {
  //       zip.file("src/index.js", generateIndexJs());

  //       // Create a Page object from the elements array
  //       const currentPage: Page = {
  //         id: "page-1",
  //         name: "Home",
  //         elements: elements,
  //       };

  //       zip.file("src/App.js", generateAppRouterJs([currentPage]));
  //       zip.file(
  //         "src/components/ContainerElement.js",
  //         generateContainerElementJs()
  //       );
  //       zip.file("src/components/DivElement.js", generateDivElementJs());
  //       zip.file("src/components/CardElement.js", generateCardElementJs());
  //     }

  //     const content = await zip.generateAsync({ type: "blob" });
  //     saveAs(content, "website-builder.zip");
  //   } catch (error) {
  //     console.error("Error generating code:", error);
  //     throw error;
  //   }
  // };

  // Function to generate code using AI
  const generateCodeWithAIModel = async (elements: DroppedElementType[]) => {
    try {
      setAiGenerationError(null);

      console.log("Generating code with AI..." + elements);
      
      // Create a design data object that includes all necessary information
      const designData = {
        framework: "Next.js", // Always use Next.js for AI generation
        pages: [
          {
            id: "page-1",
            name: "Home",
            elements: elements,
          },
        ],
        theme: {
          colors: {
            primary: "#3490dc",
            secondary: "#ffed4a",
            danger: "#e3342f",
            success: "#38c172",
          },
        },
      };

      // Call the AI API to generate code
      const generatedCode = await generateCodeWithAI(designData, selectedAIModel);
      
      // Create a text file with the generated code
      const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "nextjs-ai-generated-code.txt");
      
      return generatedCode;
    } catch (error) {
      console.error("Error generating code with AI:", error);
      setAiGenerationError(error instanceof Error ? error.message : "Unknown error occurred");
      throw error;
    }
  };

  // Main generate code function that decides which method to use
  const generateCode = useCallback(async () => {
    dispatch(setIsGenerating(true));
    // console.log("Generating code...", elements);
    
    try {
      // Use AI-based code generation
      // await generateCodeWithAIModel(elements);
      const designData = {
        framework: "Next.js",
        pages: [
          {
            id: "page-1",
            name: "Home",
            elements: elements,
          },
        ],
        theme: {
          colors: {
            primary: "#3490dc",
            secondary: "#ffed4a",
            danger: "#e3342f",
            success: "#38c172",
          },
        },
      };

      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designData,
          provider: selectedAIModel,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }
      console.log("AI-generated code:", data);
      const code = data.generatedCode;
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "nextjs-ai-generated-code.txt");
    } catch (error) {
      console.error("Error in code generation:", error);
      setAiGenerationError(error instanceof Error ? error.message : "Unknown error occurred");
      // If AI generation fails, fall back to traditional method
      // try {
      //   await generateCodeTraditional();
      // } catch (secondError) {
      //   console.error("Both code generation methods failed:", secondError);
      // }
    } finally {
      dispatch(setIsGenerating(false));
    }
  }, [elements, framework, dispatch, selectedAIModel, setAiGenerationError]);

  // Function to add more space to the canvas
  const addMoreSpace = () => {
    dispatch(setExtraHeight(extraHeight + 500)); // Add 500px more height
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={canvasContainerRef}
        className={`relative w-full flex-1 flex items-center justify-center overflow-hidden ${
          isDarkTheme ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div
          ref={(node) => {
            canvasRef.current = node;
            drop(node);
          }}
          className={`relative ${
            isDarkTheme ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
          style={{
            width: device.width,
            height: device.height + extraHeight,
            transform: `scale(${scaleFactor})`,
            transformOrigin: "center center",
            margin: "auto",
          }}
        >
          {/* {elements.map((element) => ( */}
          {elements
            .filter((el) => !el.parentId)
            .map((element) => (
              <DroppedElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                onSelect={() => dispatch(setSelectedElement(element.id))}
                onDelete={() => deleteElement(element.id)}
                onUpdate={(updatedElement) => {
                  // Create a deep copy of the elements array to ensure we're not modifying the original
                  const elementsCopy = JSON.parse(JSON.stringify(elements));

                  // Update the element in the array
                  const newElements = elementsCopy.map(
                    (el: DroppedElementType) =>
                      el.id === updatedElement.id ? updatedElement : el
                  );

                  // Update the elements state
                  throttledUpdateElements(newElements);
                }}
                scaleFactor={scaleFactor}
                isDarkTheme={isDarkTheme}
                canvasWidth={device.width}
                canvasHeight={device.height + extraHeight}
              />
            ))}
        </div>
      </div>

      <div
        className={`flex justify-between items-center p-2 ${
          isDarkTheme ? "bg-gray-800" : "bg-white"
        } border-t ${isDarkTheme ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex-1"></div>
        <div className="flex space-x-2">
          <button
            onClick={addMoreSpace}
            className={`px-3 py-1 rounded flex items-center ${
              isDarkTheme
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            Add More Space
          </button>

          {/* AI Model Selector */}
          <div className="relative">
            <button
              onClick={toggleAIModelSelector}
              className={`px-4 py-2 rounded flex items-center ${
                isDarkTheme
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {selectedAIModel}
            </button>
            
            {showAIModelSelector && (
              <div 
                className={`absolute bottom-full right-0 mb-1 rounded shadow-lg z-10 ${
                  isDarkTheme ? "bg-gray-800" : "bg-white"
                } border ${isDarkTheme ? "border-gray-700" : "border-gray-200"}`}
              >
                {Object.values(AIModelProvider).map((model) => (
                  <button
                    key={model}
                    onClick={() => selectAIModel(model)}
                    className={`block w-full text-left px-4 py-2 ${
                      selectedAIModel === model
                        ? isDarkTheme
                          ? "bg-blue-900"
                          : "bg-blue-100"
                        : ""
                    } ${
                      isDarkTheme
                        ? "hover:bg-gray-700 text-white"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={generateCode}
            disabled={isGenerating}
            className={`px-4 py-2 rounded ${
              isDarkTheme
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate Code with AI"}
          </button>
        </div>
        
        {/* Error message display */}
        {aiGenerationError && (
          <div className="absolute bottom-16 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{aiGenerationError}</span>
            <button 
              onClick={() => setAiGenerationError(null)}
              className="absolute top-0 right-0 px-2 py-1"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {selectedElementId &&
        elements.some((el) => el.id === selectedElementId) && (
          <div
            className={`w-full ${
              isDarkTheme ? "bg-gray-800" : "bg-white"
            } border-t ${isDarkTheme ? "border-gray-700" : "border-gray-200"}`}
          >
            <StyleEditor
              element={elements.find((el) => el.id === selectedElementId)!}
              onUpdate={(updatedElement) => {
                // Create a deep copy of the elements array to ensure we're not modifying the original
                const elementsCopy = JSON.parse(JSON.stringify(elements));

                // Update the element in the array
                const newElements = elementsCopy.map((el: DroppedElementType) =>
                  el.id === updatedElement.id ? updatedElement : el
                );

                // Update the elements state
                throttledUpdateElements(newElements);
              }}
              onDelete={() => deleteElement(selectedElementId)}
              isDarkTheme={isDarkTheme}
            />
            <ElementPathBreadcrumb
              elements={elements}
              selectedElementId={selectedElementId}
              onSelect={(id) => dispatch(setSelectedElement(id))}
              isDarkTheme={isDarkTheme}
            />
          </div>
        )}
    </div>
  );
}
