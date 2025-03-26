"use client";

import React, { useRef, useCallback, useMemo } from "react";
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
  onSelect: () => void;
  isSelected: boolean;
  availablePages: { id: string; name: string }[];
}

const DroppedElement: React.FC<DroppedElementProps> = ({
  element,
  allElements,
  onResize,
  onPropertiesChange,
  onSelect,
  isSelected,
  availablePages,
}) => {
  // We need to ensure the drag item always has the latest properties
  // This function will be called when the drag starts
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
      item: getDragItem, // Use the function to get the latest values
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      // Add an end callback to ensure we clean up properly
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          // If the drop was cancelled, we don't need to do anything
          console.log("Drag cancelled");
        }
      },
    }),
    [getDragItem]
  );

  // Get child elements if this is a container - memoize to prevent unnecessary recalculations
  const childElements = useMemo(() => {
    if (!element.properties.canHaveChildren) return [];
    return allElements.filter((el) => el.parentId === element.id);
  }, [element.id, element.properties.canHaveChildren, allElements]);

  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // Create throttled resize handler with both leading and trailing calls
  const throttledResize = useCallback(
    throttle(
      (id: number, width: number, height: number) => {
        onResize(id, width, height);
      },
      30,
      { leading: true, trailing: true }
    ),
    [onResize]
  );

  // Use refs to avoid circular dependencies
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const handleMouseUpRef = useRef<() => void>(() => {});

  // Create stable wrapper functions
  const handleMouseMoveWrapper = useCallback((e: MouseEvent) => {
    handleMouseMoveRef.current?.(e);
  }, []);

  const handleMouseUpWrapper = useCallback(() => {
    handleMouseUpRef.current?.();
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering onSelect
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

  // Define the handlers
  handleMouseMoveRef.current = (e: MouseEvent) => {
    if (resizeRef.current && resizeRef.current.isResizing) {
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      const newWidth = Math.max(50, resizeRef.current.startWidth + dx);
      const newHeight = Math.max(30, resizeRef.current.startHeight + dy);
      throttledResize(element.id, newWidth, newHeight);
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
        return (
          <div
            className="w-full h-full p-4 relative"
            style={{
              backgroundColor: element.properties.backgroundColor,
              padding: element.properties.padding,
              borderRadius: element.properties.borderRadius,
              borderColor: element.properties.borderColor,
              borderWidth: element.properties.borderWidth,
              borderStyle: element.properties.borderStyle,
            }}
          >
            {childElements.length > 0 ? (
              // Only render children that are actually visible (performance optimization)
              childElements.map((child) => (
                <div
                  key={child.id}
                  className="absolute"
                  style={{
                    left: child.x,
                    top: child.y,
                    width: child.width,
                    height: child.height,
                  }}
                >
                  <DroppedElement
                    element={child}
                    allElements={allElements}
                    onResize={onResize}
                    onPropertiesChange={onPropertiesChange}
                    onSelect={() => {}}
                    isSelected={false}
                    availablePages={availablePages}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-xs">
                Container Element - Drop elements here
              </div>
            )}
          </div>
        );
      case "card":
        return (
          <div
            className="w-full h-full overflow-hidden flex flex-col"
            style={{
              backgroundColor: element.properties.backgroundColor,
              color: element.properties.textColor,
              borderRadius: element.properties.borderRadius,
              boxShadow: element.properties.boxShadow,
            }}
          >
            {element.properties.imageUrl && (
              <img
                src={element.properties.imageUrl}
                alt="Card image"
                className="w-full h-24 object-cover"
              />
            )}
            <div className="p-4 flex-1">
              <h3 className="font-bold mb-2">{element.properties.title}</h3>
              <p className="text-sm mb-4">{element.properties.content}</p>
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
              {/* Using a simple star as placeholder - in a real app, you'd use an icon library */}
              ★
            </div>
          </div>
        );
      case "div":
        return (
          <div
            className="w-full h-full relative"
            style={{
              backgroundColor: element.properties.backgroundColor,
              padding: element.properties.padding,
              borderRadius: element.properties.borderRadius,
              borderColor: element.properties.borderColor,
              borderWidth: element.properties.borderWidth,
              borderStyle: element.properties.borderStyle,
            }}
          >
            {childElements.length > 0 ? (
              // Only render children that are actually visible (performance optimization)
              childElements.map((child) => (
                <div
                  key={child.id}
                  className="absolute"
                  style={{
                    left: child.x,
                    top: child.y,
                    width: child.width,
                    height: child.height,
                  }}
                >
                  <DroppedElement
                    element={child}
                    allElements={allElements}
                    onResize={onResize}
                    onPropertiesChange={onPropertiesChange}
                    onSelect={() => {}}
                    isSelected={false}
                    availablePages={availablePages}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-xs">
                Div Element - Drop elements here
              </div>
            )}
          </div>
        );
      default:
        return <div>Unknown Element</div>;
    }
  };

  // Determine if this is a full-width element that should adapt to container width
  const isFullWidthElement = ["header", "footer", "navbar", "divider"].includes(
    element.type
  );

  // Calculate percentage width for responsive elements
  const getResponsiveStyles = () => {
    // Base styles that apply to all elements
    const baseStyles = {
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      opacity: isDragging ? 0.5 : 1,
      overflow: "hidden",
    };

    return baseStyles;
  };

  return (
    <div
      onClick={onSelect} // When the element is clicked, mark it as selected.
      ref={drag}
      className={`absolute border border-gray-600 bg-gray-800 select-none transition-all duration-150 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isFullWidthElement ? "responsive-element" : ""}`}
      style={getResponsiveStyles()}
      data-element-type={element.type}
    >
      {renderContent()}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 cursor-se-resize"
        onMouseDown={handleMouseDown}
      />
      {isSelected && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl">
          {element.type}
        </div>
      )}
    </div>
  );
};

export default DroppedElement;
