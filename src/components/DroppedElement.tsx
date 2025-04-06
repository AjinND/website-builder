"use client";

import React, { useRef, useCallback, useMemo, useEffect } from "react";
import { useDrag } from "react-dnd";

import { DroppedElementType, DroppedElementProps } from "@/types/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedElement, setElements } from "@/store/canvasSlice";
// import {getAbsolutePosition} from "@/utils/calculateAbsolutePosition";

interface DragItem {
  id: number;
  type: string;
  parentId: number | null;
}

const DroppedElement: React.FC<DroppedElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  scaleFactor,
  isDarkTheme = true,
  canvasWidth,
  canvasHeight,
}) => {
  const allElements = useAppSelector((state) => state.canvas.elements);
  // Inside the component, before the return statement
  const dispatch = useAppDispatch();
  const selectedElementId = useAppSelector(
    (state) => state.canvas.selectedElementId
  );
  const elements = useAppSelector((state) => state.canvas.elements);

  // const isInsideContainer = (
  //   elAbsX: number,
  //   elAbsY: number,
  //   elWidth: number,
  //   elHeight: number,
  //   container: DroppedElementType,
  //   containerAbsX: number,
  //   containerAbsY: number
  // ) => {
  //   const paddingStr = container.properties.padding || "20px";
  //   let padding = 20;
  //   if (typeof paddingStr === "string") {
  //     const match = paddingStr.match(/^(\d+)(px|%)?$/);
  //     if (match) {
  //       padding = match[2] === "%" ? (parseInt(match[1], 10) / 100) * container.width : parseInt(match[1], 10);
  //     }
  //   } else if (typeof paddingStr === "number") {
  //     padding = paddingStr;
  //   }

  //   const innerLeft = containerAbsX + padding;
  //   const innerTop = containerAbsY + padding;
  //   const innerRight = containerAbsX + container.width - padding;
  //   const innerBottom = containerAbsY + container.height - padding;

  //   return (
  //     elAbsX >= innerLeft &&
  //     elAbsX + elWidth <= innerRight &&
  //     elAbsY >= innerTop &&
  //     elAbsY + elHeight <= innerBottom
  //   );
  // };

  const getDragItem = useCallback(
    () => ({
      id: element.id,
      type: element.type,
      parentId: element.parentId || null,
    }),
    [element.id, element.type, element.parentId]
  );

  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseUpRef = useRef<() => void>(() => {});

  const handleMouseMoveWrapper = useCallback((e: MouseEvent) => {
    handleMouseMoveRef.current?.(e);
  }, []);

  const handleMouseUpWrapper = useCallback(() => {
    handleMouseUpRef.current?.();
  }, []);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "element",
      item: getDragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          const updatedElement = {
            ...element,
            x: element.x,
            y: element.y,
          };
          onUpdate(updatedElement);
        }
      },
    }),
    [getDragItem, element, onUpdate]
  );

  useEffect(() => {
    if (dragRef.current) {
      drag(dragRef.current);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveWrapper);
      document.removeEventListener("mouseup", handleMouseUpWrapper);
    };
  }, [drag, handleMouseMoveWrapper, handleMouseUpWrapper]);

  const childElements = useMemo<DroppedElementType[]>(() => {
    if (!element.properties.canHaveChildren || !element.children) return [];
    return allElements.filter(
      (child) =>
        child.parentId === element.id || element.children?.includes(child.id)
    );
  }, [
    element.id,
    element.properties.canHaveChildren,
    element.children,
    allElements,
  ]);

  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      onSelect();

      const startX = e.clientX;
      const startY = e.clientY;
      const startElementX = element.x;
      const startElementY = element.y;

      const handleMouseMove = (e: MouseEvent) => {
        const elementStillExists = allElements.some(
          (el) => el.id === element.id
        );
        if (!elementStillExists) {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          return;
        }

        const dx = (e.clientX - startX) / scaleFactor;
        const dy = (e.clientY - startY) / scaleFactor;

        let newX = startElementX + dx;
        let newY = startElementY + dy;

        if (!element.parentId) {
          newX = Math.max(0, Math.min(newX, canvasWidth - element.width));
          newY = Math.max(0, Math.min(newY, canvasHeight - element.height));
        } else {
          const parent = allElements.find((el) => el.id === element.parentId);
          if (parent) {
            const paddingStr = parent.properties.padding || "20px";
            let padding = 20;
            if (typeof paddingStr === "string") {
              const match = paddingStr.match(/^(\d+)(px|%)?$/);
              if (match) {
                padding =
                  match[2] === "%"
                    ? (parseInt(match[1], 10) / 100) * parent.width
                    : parseInt(match[1], 10);
              }
            } else if (typeof paddingStr === "number") {
              padding = paddingStr;
            }

            const maxX = parent.width - element.width - padding;
            const maxY = parent.height - element.height - padding;

            newX = Math.max(padding, Math.min(newX, maxX));
            newY = Math.max(padding, Math.min(newY, maxY));
          }
        }

        const updatedElement = {
          ...element,
          x: newX,
          y: newY,
        };
        onUpdate(updatedElement);
      };

      const handleMouseUp = () => {
        const elementStillExists = allElements.some(
          (el) => el.id === element.id
        );
        if (!elementStillExists) {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          return;
        }

        // // Calculate absolute position
        // const { absX, absY } = getAbsolutePosition(element, allElements);

        // let newParentId: number | null = null;
        // let newX = element.x;
        // let newY = element.y;

        // // Check current parent (if any)
        // if (element.parentId) {
        //   const parent = allElements.find((el) => el.id === element.parentId);
        //   if (parent) {
        //     const parentAbs = getAbsolutePosition(parent, allElements);
        //     if (isInsideContainer(absX, absY, element.width, element.height, parent, parentAbs.absX, parentAbs.absY)) {
        //       newParentId = element.parentId; // Still inside, no change
        //     } else {
        //       newParentId = null; // Moved outside, become top-level
        //       newX = absX; // Use absolute position as canvas coordinates
        //       newY = absY;
        //     }
        //   }
        // } else {
        //   // Check for new parents among containers
        //   const containers = allElements.filter(
        //     (el) => el.properties.canHaveChildren && el.id !== element.id
        //   );
        //   for (const container of containers) {
        //     const containerAbs = getAbsolutePosition(container, allElements);
        //     if (isInsideContainer(absX, absY, element.width, element.height, container, containerAbs.absX, containerAbs.absY)) {
        //       newParentId = container.id;
        //       newX = absX - containerAbs.absX; // Relative to new parent
        //       newY = absY - containerAbs.absY;
        //       break;
        //     }
        //   }
        //   if (!newParentId) {
        //     newX = absX; // Remains top-level
        //     newY = absY;
        //   }
        // }

        // // Update element with new parentId and position
        // const updatedElement = { ...element, parentId: newParentId, x: newX, y: newY };
        // onUpdate(updatedElement);

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [
      element,
      onSelect,
      onUpdate,
      allElements,
      scaleFactor,
      canvasWidth,
      canvasHeight,
    ]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const elementStillExists = allElements.some((el) => el.id === element.id);
      if (!elementStillExists) {
        return;
      }

      onSelect();

      resizeRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: element.width,
        startHeight: element.height,
      };

      document.addEventListener("mousemove", handleMouseMoveWrapper);
      document.addEventListener("mouseup", handleMouseUpWrapper);
    },
    [
      element.width,
      element.height,
      handleMouseMoveWrapper,
      handleMouseUpWrapper,
      allElements,
      element.id,
      onSelect,
    ]
  );

  handleMouseMoveRef.current = (e: MouseEvent) => {
    if (resizeRef.current && resizeRef.current.isResizing) {
      const elementStillExists = allElements.some((el) => el.id === element.id);
      if (!elementStillExists) {
        if (resizeRef.current) {
          resizeRef.current.isResizing = false;
        }
        document.removeEventListener("mousemove", handleMouseMoveWrapper);
        document.removeEventListener("mouseup", handleMouseUpWrapper);
        return;
      }

      const dx = (e.clientX - resizeRef.current.startX) / scaleFactor;
      const dy = (e.clientY - resizeRef.current.startY) / scaleFactor;
      const newWidth = Math.max(50, resizeRef.current.startWidth + dx);
      const newHeight = Math.max(30, resizeRef.current.startHeight + dy);

      const updatedElement = {
        ...element,
        width: newWidth,
        height: newHeight,
      };
      onUpdate(updatedElement);
    }
  };

  handleMouseUpRef.current = () => {
    const elementStillExists = allElements.some((el) => el.id === element.id);
    if (!elementStillExists) {
      if (resizeRef.current) {
        resizeRef.current.isResizing = false;
      }
      document.removeEventListener("mousemove", handleMouseMoveWrapper);
      document.removeEventListener("mouseup", handleMouseUpWrapper);
      return;
    }

    if (resizeRef.current) {
      const updatedElement = {
        ...element,
        width: Math.max(50, element.width),
        height: Math.max(30, element.height),
      };
      onUpdate(updatedElement);
      resizeRef.current.isResizing = false;
    }

    document.removeEventListener("mousemove", handleMouseMoveWrapper);
    document.removeEventListener("mouseup", handleMouseUpWrapper);
  };

  const renderContent = () => {
    switch (element.type) {
      case "header":
        return (
          <div
            className="flex items-center justify-between p-2"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            <img src={element.properties.logoUrl} alt="Logo" className="h-8" />
            <nav>
              {element.properties.navLinks?.map(
                (link: { url: string; text: string }, index: number) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      color: element.properties.textColor,
                      fontSize: element.properties.fontSize,
                      fontWeight: element.properties.fontWeight,
                    }}
                    className="mx-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {link.text}
                  </a>
                )
              )}
            </nav>
          </div>
        );
      case "navbar":
        return (
          <nav
            className="p-2"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            {element.properties.menuItems?.map(
              (item: { url: string; text: string }, index: number) => (
                <a
                  key={index}
                  href="#"
                  style={{
                    color: element.properties.textColor,
                    fontSize: element.properties.fontSize,
                    fontWeight: element.properties.fontWeight,
                  }}
                  className="mx-4"
                  onClick={(e) => e.preventDefault()}
                >
                  {item.text}
                </a>
              )
            )}
          </nav>
        );
      case "jumbotron":
        return (
          <div
            className="text-center p-4"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            <h1 className="text-2xl font-bold">{element.properties.heading}</h1>
            <p className="mt-2">{element.properties.subtext}</p>
            <a
              href="#"
              className="mt-4 inline-block px-4 py-2 rounded"
              style={{ backgroundColor: "#007bff", color: "#fff" }}
              onClick={(e) => e.preventDefault()}
            >
              {element.properties.buttonText}
            </a>
          </div>
        );
      case "text":
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const updatedElement = {
                ...element,
                properties: {
                  ...element.properties,
                  content: e.currentTarget.textContent || "",
                },
              };
              onUpdate(updatedElement);
            }}
            className="w-full h-full p-2 overflow-auto"
            style={{
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
            }}
          >
            {element.properties.content}
          </div>
        );
      case "heading":
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const updatedElement = {
                ...element,
                properties: {
                  ...element.properties,
                  content: e.currentTarget.textContent || "",
                },
              };
              onUpdate(updatedElement);
            }}
            className="w-full h-full p-2 overflow-auto"
            style={{
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
              textAlign: element.properties.textAlign,
            }}
          >
            {element.properties.level === "h1" && (
              <h1 className="text-3xl font-bold">
                {element.properties.content}
              </h1>
            )}
            {element.properties.level === "h2" && (
              <h2 className="text-2xl font-bold">
                {element.properties.content}
              </h2>
            )}
            {element.properties.level === "h3" && (
              <h3 className="text-xl font-bold">
                {element.properties.content}
              </h3>
            )}
            {element.properties.level === "h4" && (
              <h4 className="text-lg font-bold">
                {element.properties.content}
              </h4>
            )}
            {element.properties.level === "h5" && (
              <h5 className="text-base font-bold">
                {element.properties.content}
              </h5>
            )}
            {element.properties.level === "h6" && (
              <h6 className="text-sm font-bold">
                {element.properties.content}
              </h6>
            )}
          </div>
        );
      case "button":
        return (
          <button
            className="w-full h-full rounded"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
              fontWeight: element.properties.fontWeight,
              borderRadius: element.properties.borderRadius,
            }}
          >
            {element.properties.text}
          </button>
        );
      case "image":
        return (
          <img
            src={element.properties.imageUrl}
            alt={element.properties.altText || "Image"}
            className="w-full h-full"
            style={{
              objectFit: element.properties.objectFit || "cover",
            }}
          />
        );
      case "footer":
        return (
          <footer
            className="p-4 w-full"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
            }}
          >
            <div className="flex flex-wrap justify-between">
              <div>
                <p>{element.properties.copyright}</p>
              </div>
              <div className="flex space-x-4">
                {element.properties.links?.map(
                  (link: { url: string; text: string }, index: number) => (
                    <a
                      key={index}
                      href="#"
                      style={{ color: element.properties.textColor }}
                      className="hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link.text}
                    </a>
                  )
                )}
              </div>
              <div className="flex space-x-4 mt-2">
                {element.properties.socialLinks?.map(
                  (link: { platform: string; url: string }, index: number) => (
                    <a
                      key={index}
                      href="#"
                      style={{ color: element.properties.textColor }}
                      className="hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link.platform}
                    </a>
                  )
                )}
              </div>
            </div>
          </footer>
        );
      case "divider":
        return (
          <hr
            style={{
              borderColor: element.properties.color,
              borderWidth: element.properties.thickness,
              borderStyle: element.properties.style,
              margin: element.properties.margin,
            }}
          />
        );
      case "container":
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor:
                element.properties.backgroundColor || "transparent",
              padding: element.properties.padding || "0.5rem",
              borderRadius: element.properties.borderRadius || "0px",
              borderColor: element.properties.borderColor || "transparent",
              borderWidth: element.properties.borderWidth || "0px",
              borderStyle: element.properties.borderStyle || "solid",
              position: "relative",
              overflow: "visible",
            }}
          >
            <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-br z-50">
              Container {element.id}
            </div>
            {childElements.length === 0 && (
              <div className="text-center text-gray-400 text-sm w-full h-full flex items-center justify-center">
                <div>
                  <div className="mb-2">Container Element #{element.id}</div>
                  <div className="text-xs">Drag and drop elements here</div>
                </div>
              </div>
            )}
          </div>
        );
      case "card":
        return (
          <div
            className="w-full h-full overflow-hidden flex flex-col"
            style={{
              backgroundColor: element.properties.backgroundColor || "#ffffff",
              color: element.properties.textColor || "#000000",
              borderRadius: element.properties.borderRadius || "8px",
              boxShadow:
                element.properties.boxShadow || "0 4px 6px rgba(0, 0, 0, 0.1)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-1 py-0.5 rounded-bl opacity-50 z-10">
              Card
            </div>
            {element.properties.imageUrl && (
              <img
                src={element.properties.imageUrl}
                alt="Card image"
                className="w-full h-24 object-cover"
              />
            )}
            <div className="p-4 flex-1">
              <h3 className="font-bold mb-2">
                {element.properties.title || "Card Title"}
              </h3>
              <p className="text-sm mb-4">
                {element.properties.content || "Card content goes here."}
              </p>
              {element.properties.buttonText && (
                <button
                  className="px-4 py-1 text-sm rounded"
                  style={{
                    backgroundColor: "#007bff",
                    color: "#ffffff",
                  }}
                >
                  {element.properties.buttonText}
                </button>
              )}
            </div>
          </div>
        );
      case "list":
        return (
          <div
            className="w-full h-full p-2 overflow-auto"
            style={{
              color: element.properties.textColor,
              fontSize: element.properties.fontSize,
            }}
          >
            {element.properties.type === "ordered" ? (
              <ol
                className="list-decimal pl-5"
                style={{ lineHeight: element.properties.spacing }}
              >
                {element.properties.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul
                className="list-disc pl-5"
                style={{ lineHeight: element.properties.spacing }}
              >
                {element.properties.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        );
      case "form":
        return (
          <form
            className="w-full h-full p-4 overflow-auto"
            style={{
              backgroundColor: element.properties.backgroundColor,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            {element.properties.fields.map((field: any, index: number) => (
              <div key={index} className="mb-4">
                <label
                  className="block mb-1 text-sm font-medium"
                  style={{ color: element.properties.labelColor }}
                >
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    className="w-full p-2 border rounded"
                    style={{ borderColor: element.properties.borderColor }}
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full p-2 border rounded"
                    style={{ borderColor: element.properties.borderColor }}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              className="px-4 py-2 rounded"
              style={{
                backgroundColor: element.properties.submitButtonColor,
                color: "#ffffff",
              }}
            >
              {element.properties.submitButtonText}
            </button>
          </form>
        );
      case "input":
        return (
          <div className="w-full h-full p-2">
            <label
              className="block mb-1 text-sm font-medium"
              style={{ color: element.properties.labelColor }}
            >
              {element.properties.label}{" "}
              {element.properties.required && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type={element.properties.type}
              placeholder={element.properties.placeholder}
              className="w-full border"
              style={{
                borderColor: element.properties.borderColor,
                borderRadius: element.properties.borderRadius,
                padding: element.properties.padding,
              }}
              required={element.properties.required}
            />
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={element.properties.videoUrl}
              title="Video"
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
              allow={element.properties.autoplay ? "autoplay" : ""}
              style={{
                width: element.properties.width,
                height: element.properties.height,
              }}
            />
          </div>
        );
      case "icon":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="text-center"
              style={{
                fontSize: element.properties.size,
                color: element.properties.color,
              }}
            >
              ★
            </div>
          </div>
        );
      case "div":
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor:
                element.properties.backgroundColor || "transparent",
              padding: element.properties.padding || "0.5rem",
              borderRadius: element.properties.borderRadius || "0px",
              borderColor: element.properties.borderColor || "transparent",
              borderWidth: element.properties.borderWidth || "0px",
              borderStyle: element.properties.borderStyle || "solid",
              position: "relative",
              overflow: "visible",
              backgroundImage:
                isSelected || childElements.length === 0
                  ? "linear-gradient(45deg, rgba(0, 128, 0, 0.03) 25%, transparent 25%, transparent 50%, rgba(0, 128, 0, 0.03) 50%, rgba(0, 128, 0, 0.03) 75%, transparent 75%, transparent)"
                  : "none",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br z-50">
              Div {element.id}
            </div>
            {childElements.length === 0 && (
              <div className="text-center text-gray-400 text-sm w-full h-full flex items-center justify-center">
                <div>
                  <div className="mb-2">Div Element #{element.id}</div>
                  <div className="text-xs">Drag and drop elements here</div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown Element</div>;
    }
  };

  const isFullWidthElement = ["header", "footer", "navbar", "divider"].includes(
    element.type
  );

  // return (
  //   <div
  //     ref={dragRef}
  //     className={`absolute cursor-move ${
  //       isSelected
  //         ? isDarkTheme
  //           ? "border-2 border-blue-500"
  //           : "border-2 border-blue-600"
  //         : ""
  //     }`}
  //     style={{
  //       left: typeof element.x === "number" && !isNaN(element.x) ? element.x : 0,
  //       top: typeof element.y === "number" && !isNaN(element.y) ? element.y : 0,
  //       width:
  //         typeof element.width === "number" && !isNaN(element.width)
  //           ? element.width
  //           : 100,
  //       height:
  //         typeof element.height === "number" && !isNaN(element.height)
  //           ? element.height
  //           : 100,
  //       opacity: isDragging ? 0.5 : 1,
  //       backgroundColor: element.properties.backgroundColor || "#ffffff",
  //       color: element.properties.textColor || "inherit",
  //       fontSize: element.properties.fontSize || "inherit",
  //       fontWeight: element.properties.fontWeight || "inherit",
  //       transform: `scale(${scaleFactor})`,
  //       transformOrigin: "top left",
  //       boxShadow: isDarkTheme
  //         ? "0 0 5px rgba(255, 255, 255, 0.3)"
  //         : "0 0 5px rgba(0, 0, 0, 0.3)",
  //       zIndex: isSelected ? 10 : 1,
  //     }}
  //     onClick={(e) => {
  //       e.stopPropagation();
  //       onSelect();
  //     }}
  //     onMouseDown={handleMouseDown}
  //   >
  //     {renderContent()}
  //     <div
  //       className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize rounded-tl"
  //       style={{ opacity: 0.7, zIndex: 100 }}
  //       onMouseDown={handleResizeMouseDown}
  //     />
  //     {isSelected && (
  //       <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-bl z-100">
  //         {element.type}{" "}
  //         {element.parentId ? `(Child of ${element.parentId})` : ""}
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <div
      ref={dragRef}
      className={`absolute cursor-move ${
        isSelected
          ? isDarkTheme
            ? "border-2 border-blue-500"
            : "border-2 border-blue-600"
          : ""
      }`}
      style={{
        left:
          typeof element.x === "number" && !isNaN(element.x) ? element.x : 0,
        top: typeof element.y === "number" && !isNaN(element.y) ? element.y : 0,
        width:
          typeof element.width === "number" && !isNaN(element.width)
            ? element.width
            : 100,
        height:
          typeof element.height === "number" && !isNaN(element.height)
            ? element.height
            : 100,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: element.properties.backgroundColor || "#ffffff",
        color: element.properties.textColor || "inherit",
        fontSize: element.properties.fontSize || "inherit",
        fontWeight: element.properties.fontWeight || "inherit",
        transform: `scale(${scaleFactor})`,
        transformOrigin: "top left",
        boxShadow: isDarkTheme
          ? "0 0 5px rgba(255, 255, 255, 0.3)"
          : "0 0 5px rgba(0, 0, 0, 0.3)",
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative w-full h-full">
        {renderContent()}
        {element.properties.canHaveChildren &&
          childElements.map((child) => (
            <DroppedElement
              key={child.id}
              element={child}
              isSelected={selectedElementId === child.id}
              onSelect={() => dispatch(setSelectedElement(child.id))}
              onDelete={() => {
                const childIds = new Set<number>();
                const findAllChildren = (parentId: number) => {
                  elements.forEach((el) => {
                    if (el.parentId === parentId) {
                      childIds.add(el.id);
                      findAllChildren(el.id);
                    }
                  });
                };
                findAllChildren(child.id);
                const newElements = elements.filter(
                  (el) => el.id !== child.id && !childIds.has(el.id)
                );
                dispatch(setElements(newElements));
                if (selectedElementId === child.id) {
                  dispatch(setSelectedElement(null));
                }
              }}
              onUpdate={(updatedChild) => {
                const newElements = elements.map((el) =>
                  el.id === updatedChild.id ? updatedChild : el
                );
                dispatch(setElements(newElements));
              }}
              scaleFactor={scaleFactor}
              isDarkTheme={isDarkTheme}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          ))}
      </div>
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize rounded-tl"
        style={{ opacity: 0.7, zIndex: 100 }}
        onMouseDown={handleResizeMouseDown}
      />
      {isSelected && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-bl z-100">
          {element.type}{" "}
          {element.parentId ? `(Child of ${element.parentId})` : ""}
        </div>
      )}
    </div>
  );
};

export default DroppedElement;
