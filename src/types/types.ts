export interface DroppedElementType {
    id: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    properties: { [key: string]: any };
  }
  
  export interface Device {
    name: string;
    width: number;
    height: number;
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
  }
  