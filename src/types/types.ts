export interface DroppedElementType {
  id: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: { [key: string]: any };
}

export interface StyleEditorProps {
  properties: { [key: string]: any };
  onChange: (newStyles: { [key: string]: any }) => void;
  elementType: string;
  availablePages: Page[];
  isDarkTheme?: boolean;
}

 interface Device {
  name: string;
  width: number;
  height: number;
}

export interface DeviceSelectorProps {
  device: { width: number; height: number; name: string };
  setDevice: (device: { width: number; height: number; name: string }) => void;
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
  elements: DroppedElementType[];
  updateElements: (elements: DroppedElementType[]) => void;
  allPages: Page[];
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