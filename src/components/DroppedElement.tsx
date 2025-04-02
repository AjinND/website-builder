"use client";

import React, { useRef, useCallback, useMemo, useEffect } from "react";
import { useDrag } from "react-dnd";
import { throttle } from "lodash";

import { DroppedElementType } from "@/types/types";

interface DroppedElementProps {
  element: DroppedElementType;
  allElements: DroppedElementType[];
  onResize: (id: number, width: number, height: number) => void;
  onPropertiesChange: (
    id: number,
    newProperties: { [key: string]: any }
  ) => void;
  onSelect: (id: number) => void;
  selectedElementId: number | null;
  availablePages: { id: string; name: string }[];
}

const DroppedElement: React.FC<DroppedElementProps> = ({
  element,
  allElements,
  onResize,
  onPropertiesChange,
  onSelect,
  selectedElementId,
  availablePages,
}) => {
  const isSelected = selectedElementId === element.id;

  const getDragItem = useCallback(
    () => ({
      id: element.id,
      type: element.type,
      parentId: element.parentId,
    }),
    [element.id, element.type, element.parentId]
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "element",
      item: getDragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          console.log("Drag cancelled");
        }
      },
    }),
    [getDragItem]
  );

  const childElements = useMemo(() => {
    if (!element.properties.canHaveChildren) return [];
  
    const isDescendantOf = (descendantId: number, ancestorId: number): boolean => {
      if (descendantId === ancestorId) return true;
      const descendant = allElements.find((el) => el.id === descendantId);
      if (!descendant || descendant.parentId === null) return false;
      return descendant.parentId !== undefined && isDescendantOf(descendant.parentId, ancestorId);
    };
  
    return allElements.filter((el) => {
      if (el.parentId !== element.id) return false;
      return !isDescendantOf(element.id, el.id);
    });
  }, [element.id, element.properties.canHaveChildren, allElements]);

  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const throttledResizeRef = useRef<Function | null>(null);

  useEffect(() => {
    throttledResizeRef.current = throttle(
      (id: number, width: number, height: number) => {
        onResize(id, width, height);
      },
      30,
      { leading: true, trailing: true }
    );

    return () => {
      if (
        throttledResizeRef.current &&
        "cancel" in throttledResizeRef.current
      ) {
        (throttledResizeRef.current as any).cancel();
      }
    };
  }, [onResize]);

  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseUpRef = useRef<() => void>(() => {});

  const handleMouseMoveWrapper = useCallback((e: MouseEvent) => {
    handleMouseMoveRef.current?.(e);
  }, []);

  const handleMouseUpWrapper = useCallback(() => {
    handleMouseUpRef.current?.();
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
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
    ]
  );

  handleMouseMoveRef.current = (e: MouseEvent) => {
    if (resizeRef.current && resizeRef.current.isResizing) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const newWidth = Math.max(50, resizeRef.current.startWidth + dx);
      const newHeight = Math.max(30, resizeRef.current.startHeight + dy);

      if (throttledResizeRef.current) {
        throttledResizeRef.current(element.id, newWidth, newHeight);
      }
    }
  };

  handleMouseUpRef.current = () => {
    if (resizeRef.current) {
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
            onBlur={(e) =>
              onPropertiesChange(element.id, {
                content: e.currentTarget.textContent || "",
              })
            }
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
            onBlur={(e) =>
              onPropertiesChange(element.id, {
                content: e.currentTarget.textContent || "",
              })
            }
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
        // const childElements = allElements.filter((el) => el.parentId === element.id);
        console.log(`Rendering container ${element.id} with childElements:`, childElements);
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
            {childElements.length > 0 ? (
              childElements.map((child) => (
                <div
                  key={`child-${element.id}-${child.id}`}
                  className="absolute"
                  style={{
                    left: child.x,
                    top: child.y,
                    width: child.width,
                    height: child.height,
                    zIndex: 5,
                    border: "2px solid red", // Debug border to visualize child element boundaries
                    overflow: "visible", // Ensure child content isn't clipped
                  }}
                >
                  <DroppedElement
                    element={child}
                    allElements={allElements}
                    onResize={onResize}
                    onPropertiesChange={onPropertiesChange}
                    onSelect={onSelect}
                    selectedElementId={selectedElementId}
                    availablePages={availablePages}
                  />
                </div>
              ))
            ) : (
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
            {childElements.length > 0 ? (
              childElements.map((child) => (
                <div
                  key={`div-child-${element.id}-${child.id}`}
                  className="absolute"
                  style={{
                    left: child.x,
                    top: child.y,
                    width: child.width,
                    height: child.height,
                    zIndex: 5,
                    overflow: "visible", // Ensure child content isn't clipped
                  }}
                >
                  <DroppedElement
                    element={child}
                    allElements={allElements}
                    onResize={onResize}
                    onPropertiesChange={onPropertiesChange}
                    onSelect={onSelect}
                    selectedElementId={selectedElementId}
                    availablePages={availablePages}
                  />
                </div>
              ))
            ) : (
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

  const getResponsiveStyles = () => {
    const parent = allElements.find((el) => el.id === element.parentId);
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
      const clampedX = Math.max(padding, Math.min(innerWidth - element.width, element.x));
      const clampedY = Math.max(padding, Math.min(innerHeight - element.height, element.y));
      return {
        left: clampedX,
        top: clampedY,
        width: element.width,
        height: element.height,
        opacity: isDragging ? 0.5 : 1,
        overflow: "visible",
        pointerEvents: "auto",
      };
    }
    return {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      opacity: isDragging ? 0.5 : 1,
      overflow: "visible",
      pointerEvents: "auto",
    };
  };

  // const getResponsiveStyles = () => {
  //   const baseStyles = {
  //     left: element.x,
  //     top: element.y,
  //     width: element.width,
  //     height: element.height,
  //     opacity: isDragging ? 0.5 : 1,
  //     overflow: "visible",
  //     pointerEvents: "auto",
  //   };
  //   return baseStyles;
  // };

  const hasSelectedParent = useMemo(() => {
    if (!element.parentId) return false;
    let currentParentId: number | null = element.parentId;
    while (currentParentId) {
      if (currentParentId === selectedElementId) {
        return true;
      }
      const parentElement = allElements.find((el) => el.id === currentParentId);
      if (!parentElement) break;
      currentParentId =
        parentElement.parentId !== undefined ? parentElement.parentId : null;
    }
    return false;
  }, [element.parentId, selectedElementId, allElements]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
      ref={drag}
      className={`border transition-all duration-150 ${
        isSelected
          ? "ring-2 ring-blue-500 border-blue-500"
          : hasSelectedParent
          ? "border-blue-300 border-dashed"
          : "border-gray-200"
      } ${isFullWidthElement ? "responsive-element" : ""}`}
      style={{
        ...getResponsiveStyles(),
        backgroundColor: isSelected
          ? "rgba(59, 130, 246, 0.05)"
          : "transparent",
        position: "absolute",
        overflow: "visible",
        zIndex: isSelected ? 50 : hasSelectedParent ? 40 : 30,
        boxSizing: "border-box",
        pointerEvents: "auto",
      }}
      data-element-type={element.type}
      data-element-id={element.id}
      data-parent-id={element.parentId || "none"}
    >
      {renderContent()}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl"
        style={{ opacity: 0.7, zIndex: 100 }}
        onMouseDown={handleMouseDown}
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

export default React.memo(DroppedElement);
