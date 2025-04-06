import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import canvasReducer from './canvasSlice';
import pageReducer from './pageSlice';
import themeReducer from './themeSlice';
import logger from './middleware/logger';
import api from './middleware/api';

// Configure persistence for each reducer
const canvasPersistConfig = {
  key: 'canvas',
  storage,
  whitelist: ['elements', 'selectedElementId', 'scaleFactor', 'extraHeight'],
};

const pagePersistConfig = {
  key: 'pages',
  storage,
  whitelist: ['pages', 'currentPageId'],
};

const themePersistConfig = {
  key: 'theme',
  storage,
  whitelist: ['isDarkTheme'],
};

// Create persisted reducers
const persistedCanvasReducer = persistReducer(canvasPersistConfig, canvasReducer);
const persistedPageReducer = persistReducer(pagePersistConfig, pageReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

export const store = configureStore({
  reducer: {
    canvas: persistedCanvasReducer,
    pages: persistedPageReducer,
    theme: persistedThemeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger, api),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 