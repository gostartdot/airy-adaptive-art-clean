import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signupData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    contactNumber: string;
  } | null;
}

// Helper function to get user from localStorage
const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  signupData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    setSignupData: (state, action: PayloadAction<AuthState['signupData']>) => {
      state.signupData = action.payload;
    },
    clearSignupData: (state) => {
      state.signupData = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.signupData = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = getUserFromStorage();
      
      if (token && user) {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const {
  setCredentials,
  setSignupData,
  clearSignupData,
  logout,
  setLoading,
  setUser,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;
