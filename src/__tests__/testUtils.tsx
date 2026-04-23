import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../store/authSlice';
import type { User } from '../types';

interface TestAuthState {
  token: string | null;
  user: User | null;
}

function createTestStore(preloadedState?: { auth: TestAuthState }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: { auth: TestAuthState };
}

function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: CustomRenderOptions = {}
) {
  const store = createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export { renderWithProviders, createTestStore };
