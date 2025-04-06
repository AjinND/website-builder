import { Middleware } from '@reduxjs/toolkit';

// Type guard to check if an action has a type property
function isAction(action: unknown): action is { type: string } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string'
  );
}

const logger: Middleware = (store) => (next) => (action: unknown) => {
  if (process.env.NODE_ENV !== 'production' && isAction(action)) {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

export default logger; 