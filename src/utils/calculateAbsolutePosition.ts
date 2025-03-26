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
    absX += parent.x;
    absY += parent.y;
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
