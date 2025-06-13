/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { signIn, SignInResponse } from 'next-auth/react';
import { LoginForm } from './LoginForm';
import React from 'react';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

const mockRouter = {
  push: mockPush,
  refresh: mockRefresh,
  back: mockBack,
  forward: mockForward,
  replace: mockReplace,
  prefetch: mockPrefetch,
};

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('show-password-button')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('renders form labels correctly', () => {
      render(<LoginForm />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('shows and hides password when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const passwordInput = screen.getByTestId('password-input');
      const toggleButton = screen.getByTestId('show-password-button');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveTextContent('Show');

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveTextContent('Hide');

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveTextContent('Show');
    });
  });

  describe('Validation of form inputs', () => {
    it('displays validation errors for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Invalid email address or password')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Successful login', () => {
    it('calls signIn with correct credentials on valid form submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('handles form submission with Enter key', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('disables form inputs and shows loading state during login', async () => {
      const user = userEvent.setup();
      // Mock signIn to return a promise that doesn't resolve immediately
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve as (value: SignInResponse) => void;
      });
      mockSignIn.mockReturnValue(signInPromise as Promise<SignInResponse>);

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the promise
      resolveSignIn!({ ok: true });

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('redirects to /albums on successful login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: '/albums',
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/albums');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Failed login', () => {
    it('displays error message on failed login', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
        status: 401,
        url: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('displays generic error message on signIn exception', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
        expect(
          screen.getByText('Sorry, something went wrong. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('maintains form state after failed login attempt', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
        status: 401,
        url: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Form values should be preserved
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('wrongpassword');
    });
  });

  describe('Subsequent login attempt', () => {
    it('clears error message on new submission attempt', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValueOnce({
        ok: false,
        error: 'First error',
        status: 401,
        url: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      // First submission with error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear the error
      mockSignIn.mockResolvedValueOnce({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });

    it('prevents form submission when already logging in', async () => {
      const user = userEvent.setup();
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValue(signInPromise);

      render(<LoginForm />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('login-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // First click
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
      });

      // Second click should be ignored
      await user.click(submitButton);

      expect(mockSignIn).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolveSignIn!({ ok: true });
    });
  });
});
