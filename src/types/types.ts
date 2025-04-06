export interface DroppedElementType {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: { [key: string]: any };
  parentId?: number | null;
  children?: number[];
}

export interface StyleEditorProps {
  element: DroppedElementType;
  onUpdate: (updatedElement: DroppedElementType) => void;
  onDelete: () => void;
  isDarkTheme?: boolean;
}

export interface Device {
  name: string;
  width: number;
  height: number;
}

export interface DeviceSelectorProps {
  device: Device;
  setDevice: (device: Device) => void;
  isDarkTheme?: boolean;
}

export interface Page {
  id: string;
  name: string;
  elements: DroppedElementType[];
}

export interface CanvasProps {
  framework: string;
  device: Device;
  isDarkTheme?: boolean;
}

export interface DroppedElementProps {
  element: DroppedElementType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updatedElement: DroppedElementType) => void;
  scaleFactor: number;
  isDarkTheme?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export interface ElementPathBreadcrumbProps {
  elements: DroppedElementType[];
  selectedElementId: number | null;
  onSelect: (id: number) => void;
  isDarkTheme?: boolean;
}

export interface ToolboxItemProps {
  type: string;
  children: React.ReactNode;
  description: string;
  icon?: string;
}

export interface CategoryProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ToolboxProps {
  isDarkTheme?: boolean;
}