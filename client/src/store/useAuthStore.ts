interface User {
  _id: string;
  name: string;
  email: string;
  photos: string[];
  credits: number;
  bio?: string;
  interests?: string[];
  city?: string;
  matchedUsers?: any[];
  createdAt?: Date;
  preferences?: {
    showMe: string[];
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthStore {
  private state: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  login(user: User, token: string) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.state = { user, token, isAuthenticated: true };
    this.notify();
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.state = { user: null, token: null, isAuthenticated: false };
    this.notify();
  }

  updateUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.state = { ...this.state, user };
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const authStore = new AuthStore();

// React hook
import { useState, useEffect } from 'react';

export function useAuth() {
  const [state, setState] = useState(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: (user: User, token: string) => authStore.login(user, token),
    logout: () => authStore.logout(),
    updateUser: (user: User) => authStore.updateUser(user),
  };
}

