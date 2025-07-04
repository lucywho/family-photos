import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { RegistrationForm } from './RegistrationForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
}));

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: jest.fn(() => ({ pending: false })),
}));

jest.mock('@/lib/constants', () => ({
  APP_NAME: 'TestApp',
  PASSWORD_REQUIREMENTS: 'Does not meet password requirements',
}));

const mockPush = jest.fn();
const mockFormAction = jest.fn();

// Mock ResizeObserver from shadcn/ui
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('RegistrationForm', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useActionState as jest.Mock).mockReturnValue([
      { error: null, success: false },
      mockFormAction,
    ]);

    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('renders all form fields', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-agreement-check')).toBeInTheDocument();
      expect(
        screen.getByTestId('submit-registration-button')
      ).toBeInTheDocument();
    });

    it('renders password requirements', () => {
      render(<RegistrationForm />);

      const requirements = screen.getByTestId('password-requirements');
      expect(requirements).toBeInTheDocument();
      expect(requirements).toHaveTextContent('Be at least 6 characters long');
      expect(requirements).toHaveTextContent('Include a lowercase letter');
      expect(requirements).toHaveTextContent('Include an uppercase letter');
      expect(requirements).toHaveTextContent('Include a number');
    });

    it('renders privacy statement with app name', () => {
      render(<RegistrationForm />);

      const privacyStatement = screen.getByTestId('privacy-statement');
      expect(privacyStatement).toHaveTextContent('TestApp');
    });

    it('has password field hidden by default', () => {
      render(<RegistrationForm />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form interactions', () => {
    it('allows typing in username field', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const usernameInput = screen.getByTestId('username-input');
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('allows typing in email field', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'Password123');

      expect(passwordInput).toHaveValue('Password123');
    });

    it('toggles password visibility when show/hide button is clicked', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

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

    it('allows checking privacy agreement checkbox', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const checkbox = screen.getByTestId('privacy-agreement-check');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Form validation', () => {
    it('shows validation error for short username', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const usernameInput = screen.getByTestId('username-input');

      await user.type(usernameInput, 'ab');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Username must be at least 3 characters')
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for long username', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const usernameInput = screen.getByTestId('username-input');

      await user.type(usernameInput, 'a'.repeat(21));
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Username must be at most 20 characters')
        ).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('shows validation error for weak password', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const passwordInput = screen.getByTestId('password-input');
      await user.type(passwordInput, 'weak');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Does not meet password requirements')
        ).toBeInTheDocument();
      });
    });

    it('validates all fields correctly with valid input', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'Password123');
      await user.click(screen.getByTestId('privacy-agreement-check'));

      await user.click(screen.getByTestId('submit-registration-button'));

      await waitFor(() => {
        expect(
          screen.queryByText('Username must be at least 3 characters')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Invalid email address')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/Password must be at least 6 characters long/)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('You must agree to the privacy policy')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('calls form action when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'Password123');
      await user.click(screen.getByTestId('privacy-agreement-check'));

      await user.click(screen.getByTestId('submit-registration-button'));

      await waitFor(() => {
        expect(mockFormAction).toHaveBeenCalled();
      });
    });

    it('shows loading state when form is being submitted', () => {
      (useFormStatus as jest.Mock).mockReturnValue({
        pending: true,
      });

      render(<RegistrationForm />);

      const submitButton = screen.getByTestId('submit-registration-button');
      expect(submitButton).toHaveTextContent('Registering...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error states', () => {
    it('displays error message when registration fails', () => {
      (useActionState as jest.Mock).mockReturnValue([
        { error: 'Registration failed. Please try again.', success: false },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      expect(
        screen.getByText('Registration failed. Please try again.')
      ).toBeInTheDocument();
    });
  });

  describe('Success state', () => {
    it('displays success message and go to login button when registration succeeds', () => {
      (useActionState as jest.Mock).mockReturnValue([
        { error: null, success: true },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      expect(screen.getByText(/Registration successful!/)).toBeInTheDocument();
      expect(screen.getByText('Go to Login')).toBeInTheDocument();

      expect(screen.queryByTestId('username-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('email-input')).not.toBeInTheDocument();
      expect(screen.queryByTestId('password-input')).not.toBeInTheDocument();
    });

    it('navigates to login page when "Go to Login" button is clicked', async () => {
      const user = userEvent.setup();

      (useActionState as jest.Mock).mockReturnValue([
        { error: null, success: true },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      const goToLoginButton = screen.getByText('Go to Login');
      await user.click(goToLoginButton);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure with labels and inputs', () => {
      render(<RegistrationForm />);

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Privacy Agreement')).toBeInTheDocument();

      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-agreement-check')).toBeInTheDocument();
    });

    it('has required attributes on form inputs', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('username-input')).toHaveAttribute('required');
      expect(screen.getByTestId('email-input')).toHaveAttribute('required');
      expect(screen.getByTestId('password-input')).toHaveAttribute('required');
    });

    it('has proper input types', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('username-input')).toHaveAttribute(
        'type',
        'text'
      );
      expect(screen.getByTestId('email-input')).toHaveAttribute(
        'type',
        'email'
      );
      expect(screen.getByTestId('password-input')).toHaveAttribute(
        'type',
        'password'
      );
    });
  });
});
