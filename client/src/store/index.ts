import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Export types directly to avoid circular dependency
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export types from types file (for backward compatibility)
export type { RootState as RootStateFromTypes, AppDispatch as AppDispatchFromTypes } from './types';

// Typed hooks
export { useDispatch, useSelector } from 'react-redux';
export type { TypedUseSelectorHook } from 'react-redux';
