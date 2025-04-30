import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Page } from '@/types/types';

interface PageState {
  pages: Page[];
  currentPageId: string | null;
}

const initialState: PageState = {
  pages: [],
  currentPageId: null,
};

const pageSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    setPages: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
    },
    addPage: (state, action: PayloadAction<Page>) => {
      state.pages.push(action.payload);
    },
    updatePage: (state, action: PayloadAction<Page>) => {
      const index = state.pages.findIndex(page => page.id === action.payload.id);
      if (index !== -1) {
        state.pages[index] = action.payload;
      }
    },
    deletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter(page => page.id !== action.payload);
    },
    setCurrentPage: (state, action: PayloadAction<string | null>) => {
      state.currentPageId = action.payload;
    },
  },
});

export const {
  setPages,
  addPage,
  updatePage,
  deletePage,
  setCurrentPage,
} = pageSlice.actions;

export default pageSlice.reducer;