import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DroppedElementType } from '@/types/types';
import { AppThunk } from './store'; // Define this type in store.ts

export interface CanvasState {
  elements: DroppedElementType[];
  selectedElementId: number | null;
  scaleFactor: number;
  isResponsivePreview: boolean;
  extraHeight: number;
  isGenerating: boolean;
}

const initialState: CanvasState = {
  elements: [],
  selectedElementId: null,
  scaleFactor: 1,
  isResponsivePreview: false,
  extraHeight: 0,
  isGenerating: false,
};

export const addElement = (newElement: DroppedElementType): AppThunk => (dispatch, getState) => {
  const { canvas } = getState();
  const currentElements = [...canvas.elements];

  // If it's a child element, update the parent's children array
  if (newElement.parentId) {
    const containerIndex = currentElements.findIndex(el => el.id === newElement.parentId);
    if (containerIndex !== -1) {
      const updatedContainer = {
        ...currentElements[containerIndex],
        children: [...(currentElements[containerIndex].children || []), newElement.id]
      };
      currentElements[containerIndex] = updatedContainer;
    }
  }

  currentElements.push(newElement);
  dispatch(setElements(currentElements));
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setElements: (state, action: PayloadAction<DroppedElementType[]>) => {
      state.elements = action.payload;
    },
    setSelectedElement: (state, action: PayloadAction<number | null>) => {
      state.selectedElementId = action.payload;
    },
    setScaleFactor: (state, action: PayloadAction<number>) => {
      state.scaleFactor = action.payload;
    },
    setResponsivePreview: (state, action: PayloadAction<boolean>) => {
      state.isResponsivePreview = action.payload;
    },
    setExtraHeight: (state, action: PayloadAction<number>) => {
      state.extraHeight = action.payload;
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
  },
});

export const {
  setElements,
  setSelectedElement,
  setScaleFactor,
  setResponsivePreview,
  setExtraHeight,
  setIsGenerating,
} = canvasSlice.actions;

export default canvasSlice.reducer; 