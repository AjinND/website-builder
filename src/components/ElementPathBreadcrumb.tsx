"use client";

import React, { useMemo } from "react";
import { DroppedElementType } from "@/types/types";

interface ElementPathBreadcrumbProps {
  elementId: number;
  allElements: DroppedElementType[];
  onSelectElement: (id: number) => void;
  isDarkTheme?: boolean;
}

const ElementPathBreadcrumb: React.FC<ElementPathBreadcrumbProps> = ({
  elementId,
  allElements,
  onSelectElement,
  isDarkTheme = true,
}) => {
  // Build the element path from the current element up to the root
  const elementPath = useMemo(() => {
    const path: DroppedElementType[] = [];
    let currentId: number | null = elementId;
    
    // Prevent infinite loops
    const maxDepth = 10;
    let depth = 0;
    
    while (currentId && depth < maxDepth) {
      const element = allElements.find(el => el.id === currentId);
      if (!element) break;
      
      path.unshift(element); // Add to the beginning of the array
      currentId = element.parentId;
      depth++;
    }
    
    return path;
  }, [elementId, allElements]);

  if (elementPath.length <= 1) return null;

  return (
    <div className={`text-xs mb-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
      <span className="mr-2">Path:</span>
      {elementPath.map((element, index) => (
        <React.Fragment key={`${element.id}-${index}`}>
          <button
            onClick={() => onSelectElement(element.id)}
            className={`hover:underline ${
              index === elementPath.length - 1
                ? isDarkTheme ? 'text-blue-400 font-medium' : 'text-blue-600 font-medium'
                : ''
            }`}
          >
            {element.type}
          </button>
          {index < elementPath.length - 1 && (
            <span className="mx-1">›</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ElementPathBreadcrumb;