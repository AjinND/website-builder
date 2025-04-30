import React from 'react';

// Element and Page Types
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

export interface Page {
  id: string;
  name: string;
  elements: DroppedElementType[];
}

// Device Types
export interface Device {
  name: string;
  width: number;
  height: number;
}

// Component Props Types
export interface StyleEditorProps {
  element: DroppedElementType;
  onUpdate: (updatedElement: DroppedElementType) => void;
  onDelete: () => void;
  isDarkTheme?: boolean;
}

export interface DeviceSelectorProps {
  device: Device;
  setDevice: (device: Device) => void;
  isDarkTheme?: boolean;
}

export interface CanvasProps {
  framework: string;
  device: {
    name: string;
    width: number;
    height: number;
  };
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

// AI Model Types
export enum AIModelProvider {
  GEMINI = 'Gemini',
  OPENAI = 'Openai',
  GROK = 'Grok',
  DEEPSEEK = 'Deepseek'
}

export interface AIModelRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

export interface AIModelResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIModelConfig {
  baseUrl: string;
  defaultModel: string;
  apiKeyEnvVar: string;
  headers: (apiKey: string) => {
    'Content-Type': string;
    'Authorization': string;
  };
  formatPayload: (designData: any, model: string) => any;
  parseResponse: (response: any) => string;
  getUrl: (baseUrl: string, model: string) => string;
}

export interface ServerAIModelConfig {
  baseURL: string;
  defaultModel: string;
  apiKeyEnvVar: string;
}