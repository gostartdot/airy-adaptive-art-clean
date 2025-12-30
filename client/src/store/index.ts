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



// Typed hooks
export { useDispatch, useSelector } from 'react-redux';
export type { TypedUseSelectorHook } from 'react-redux';
