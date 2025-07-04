/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordForm } from './ResetPasswordForm';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock the password reset action - corrected import name
jest.mock('@/app/actions/auth', () => ({
  resetPassword: jest.fn(),
}));

describe('ResetPasswordForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { useRouter } = require('next/navigation');
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<ResetPasswordForm />);

      expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
    });

    it('renders form labels and buttons correctly', () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByTestId('submit-reset-password')).toBeInTheDocument();
      expect(screen.getByTestId('home-button')).toBeInTheDocument();
    });

    it('renders correct button text initially', () => {
      render(<ResetPasswordForm />);

      expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    const user = userEvent.setup();

    it('prevents submission with invalid email format', async () => {
      const { resetPassword } = require('@/app/actions/auth');

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled();
      });
    });

    it('prevents submission with empty email', async () => {
      const { resetPassword } = require('@/app/actions/auth');

      render(<ResetPasswordForm />);

      const submitButton = screen.getByTestId('submit-reset-password');

      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled();
      });
    });

    it('allows submission with valid email format', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      resetPassword.mockResolvedValueOnce(undefined);

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Form Submission', () => {
    const user = userEvent.setup();

    it('successfully submits form with valid email', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      resetPassword.mockResolvedValueOnce(undefined); // resetPassword doesn't return anything on success

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      });

      // Check success message appears
      await waitFor(() => {
        expect(
          screen.getByTestId('reset-password-success')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/If an account exists with this email/)
        ).toBeInTheDocument();
      });

      // Check button text changes to "Home"
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles submission error', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      resetPassword.mockRejectedValueOnce(new Error('Network error'));

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('reset-password-failure')
        ).toBeInTheDocument();
        expect(
          screen.getByText(/An error occurred while sending the reset email/)
        ).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const { resetPassword } = require('@/app/actions/auth');

      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      resetPassword.mockReturnValueOnce(pendingPromise);

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();

      resolvePromise!();

      await waitFor(() => {
        expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
      });
    });

    it('clears email field after successful submission', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      resetPassword.mockResolvedValueOnce(undefined);

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      expect(emailInput.value).toBe('test@example.com');

      await user.click(submitButton);

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith('test@example.com');
      });

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });

  describe('Navigation', () => {
    const user = userEvent.setup();

    it('navigates to home when Cancel button is clicked', async () => {
      render(<ResetPasswordForm />);

      const homeButton = screen.getByTestId('home-button');

      await user.click(homeButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('navigates to home when Home button is clicked after success', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      resetPassword.mockResolvedValueOnce(undefined);

      render(<ResetPasswordForm />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-reset-password');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      const homeButton = screen.getByText('Home');
      await user.click(homeButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
