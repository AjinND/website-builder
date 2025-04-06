"use client";

import React, { useMemo } from "react";
import { DroppedElementType, ElementPathBreadcrumbProps } from "@/types/types";

const ElementPathBreadcrumb: React.FC<ElementPathBreadcrumbProps> = ({
  elements,
  selectedElementId,
  onSelect,
  isDarkTheme = true,
}) => {
  // Build the element path from the current element up to the root
  const elementPath = useMemo(() => {
    if (selectedElementId === null) return [];

    const path: DroppedElementType[] = [];
    let currentId: number | null = selectedElementId;

    // Prevent infinite loops
    const maxDepth = 10;
    let depth = 0;

    while (currentId !== null && depth < maxDepth) {
      const element = elements.find((el) => el.id === currentId);
      if (!element) break;

      path.unshift(element); // Add to the beginning of the array
      currentId = element.parentId ?? null;
      depth++;
    }

    return path;
  }, [selectedElementId, elements]);

  if (elementPath.length <= 1) return null;

  return (
    <div
      className={`fixed top-4 left-4 z-50 text-xs ${
        isDarkTheme ? "text-gray-300" : "text-gray-600"
      }`}
    >
      <span className="mr-2">Path:</span>
      {elementPath.map((element, index) => (
        <React.Fragment key={`${element.id}-${index}`}>
          <button
            onClick={() => onSelect(element.id)}
            className={`hover:underline ${
              index === elementPath.length - 1
                ? isDarkTheme
                  ? "text-blue-400 font-semibold"
                  : "text-blue-600 font-semibold"
                : ""
            }`}
          >
            {element.type}
          </button>
          {index < elementPath.length - 1 && <span className="mx-1">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ElementPathBreadcrumb;
