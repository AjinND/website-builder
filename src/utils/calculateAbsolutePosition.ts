import { DroppedElementType } from "@/types/types";

export const getAbsolutePosition = (el: DroppedElementType, elements: DroppedElementType[]) => {
  let absX = el.x;
  let absY = el.y;
  let currentEl = el;
  let visitedNodes = new Set();

  while (currentEl.parentId && !visitedNodes.has(currentEl.id)) {
    visitedNodes.add(currentEl.id);
    const parent = elements.find((p) => p.id === currentEl.parentId);
    if (!parent) break;

    // Add parent's position
    absX += parent.x;
    absY += parent.y;

    // We only need to add padding once for the immediate parent of the element
    // This is because the child's x,y coordinates are already relative to the parent's content area
    // and should not include padding again for each level of nesting
    if (parent.id === el.parentId && parent.properties.canHaveChildren) {
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
