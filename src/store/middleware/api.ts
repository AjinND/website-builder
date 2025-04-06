import { Middleware } from '@reduxjs/toolkit';
import axios from 'axios';

// Define action types for API calls
export const API_REQUEST = 'api/request';
export const API_SUCCESS = 'api/success';
export const API_ERROR = 'api/error';

// Define the API request action type
interface ApiRequestAction {
  type: typeof API_REQUEST;
  payload: {
    url: string;
    method: string;
    data?: any;
    onSuccess?: string;
    onError?: string;
  };
}

// Type guard to check if an action is an API request
function isApiRequest(action: unknown): action is ApiRequestAction {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    action.type === API_REQUEST &&
    'payload' in action &&
    typeof action.payload === 'object' &&
    action.payload !== null &&
    'url' in action.payload &&
    'method' in action.payload
  );
}

// Action creators
export const apiRequest = (url: string, method: string, data?: any, onSuccess?: string, onError?: string) => ({
  type: API_REQUEST,
  payload: {
    url,
    method,
    data,
    onSuccess,
    onError,
  },
});

// API middleware
const api: Middleware = () => (next) => async (action: unknown) => {
  if (!isApiRequest(action)) {
    return next(action);
  }

  const { url, method, data, onSuccess, onError } = action.payload;

  try {
    const response = await axios({
      url,
      method,
      data,
    });

    // Dispatch success action
    if (onSuccess) {
      next({
        type: onSuccess,
        payload: response.data,
      });
    }

    return response.data;
  } catch (error) {
    // Dispatch error action
    if (onError) {
      next({
        type: onError,
        payload: error,
      });
    }

    throw error;
  }
};

export default api; 