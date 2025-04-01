import { DroppedElementType } from "@/types/types";

export const getAbsolutePosition = (
  el: DroppedElementType,
  elements: DroppedElementType[]
) => {
  let currentEl = el;
  let absX = currentEl.x;
  let absY = currentEl.y;

  while (currentEl.parentId) {
    const parent = elements.find((p) => p.id === currentEl.parentId);
    if (!parent) break;

    // Add parent's position
    absX += parent.x;
    absY += parent.y;

    // Account for parent's padding if it's a container
    if (parent.properties.canHaveChildren) {
      // Parse padding value - default to 20px if not specified or if parsing fails
      const paddingStr = parent.properties.padding || "20px";
      let padding = 20; // Default padding in pixels

      // Try to parse the padding value
      if (typeof paddingStr === 'string') {
        const match = paddingStr.match(/^(\d+)(?:px)?$/);
        if (match) {
          padding = parseInt(match[1], 10);
        }
      } else if (typeof paddingStr === 'number') {
        padding = paddingStr;
      }

      // Add padding to the absolute position
      absX += padding;
      absY += padding;
    }

    currentEl = parent;
  }

  return { absX, absY };
};

export const getDepth = (el: DroppedElementType, elements: DroppedElementType[]) => {
  let depth = 0;
  let currentEl = el;
  while (currentEl.parentId) {
    depth++;
    const parent = elements.find((p) => p.id === currentEl.parentId);
    if (!parent) break;
    currentEl = parent;
  }
  return depth;
};
