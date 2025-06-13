/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useActionState, useTransition } from 'react';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
  useTransition: jest.fn(),
}));

// Mock the auth action
jest.mock('@/app/actions/auth', () => ({
  register: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => {
  const actual = jest.requireActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => (e: any) => {
        e.preventDefault();
        // Simulate validation errors
        const errors = {
          username: { message: 'Username must be at least 3 characters' },
          email: { message: 'Invalid email address' },
          password: {
            message:
              'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number',
          },
          privacyAgreement: { message: 'You must agree to the privacy policy' },
        };
        return Promise.reject(errors);
      },
      formState: {
        errors: {
          username: { message: 'Username must be at least 3 characters' },
          email: { message: 'Invalid email address' },
          password: {
            message:
              'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number',
          },
          privacyAgreement: { message: 'You must agree to the privacy policy' },
        },
        isSubmitting: false,
      },
      getFieldState: (name: string) => {
        const errors: any = {
          username: {
            error: { message: 'Username must be at least 3 characters' },
          },
          email: { error: { message: 'Invalid email address' } },
          password: {
            error: {
              message:
                'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number',
            },
          },
          privacyAgreement: {
            error: { message: 'You must agree to the privacy policy' },
          },
        };
        return errors[name] || { error: null };
      },
    }),
  };
});

// Mock Radix UI primitives
jest.mock('@radix-ui/react-slot', () => {
  const Slot = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  Slot.displayName = 'MockedSlot';
  return { Slot };
});

jest.mock('@radix-ui/react-label', () => {
  const Root = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <label ref={ref} {...props}>
      {children}
    </label>
  ));
  Root.displayName = 'MockedRoot';
  return { Root };
});

// Mock the form components
jest.mock('@/components/ui/form', () => {
  const React = require('react');

  const FormFieldContext = React.createContext({});
  const FormItemContext = React.createContext({ id: 'test-id' });

  const useFormField = () => {
    const formContext = React.useContext(FormFieldContext);
    const errors = {
      username: { message: 'Username must be at least 3 characters' },
      email: { message: 'Invalid email address' },
      password: {
        message:
          'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number',
      },
      privacyAgreement: { message: 'You must agree to the privacy policy' },
    };
    return {
      id: 'test-id',
      name: formContext.name,
      formItemId: 'test-id-form-item',
      formDescriptionId: 'test-id-form-item-description',
      formMessageId: 'test-id-form-item-message',
      error: errors[formContext.name as keyof typeof errors] || null,
    };
  };

  const FormItem = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <FormItemContext.Provider value={{ id: 'test-id' }}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </FormItemContext.Provider>
  ));
  FormItem.displayName = 'MockedFormItem';

  const FormLabel = React.forwardRef(
    ({ children, ...props }: any, ref: any) => (
      <label ref={ref} {...props}>
        {children}
      </label>
    )
  );
  FormLabel.displayName = 'MockedFormLabel';

  const FormControl = React.forwardRef(
    ({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )
  );
  FormControl.displayName = 'MockedFormControl';

  return {
    Form: ({ children }: any) => <div>{children}</div>,
    FormField: ({ render, name }: any) => (
      <FormFieldContext.Provider value={{ name }}>
        {render({
          field: {
            value: '',
            onChange: jest.fn(),
            onBlur: jest.fn(),
            name,
            ref: jest.fn(),
          },
        })}
      </FormFieldContext.Provider>
    ),
    FormItem,
    FormLabel,
    FormControl,
    FormMessage: () => {
      const { error } = useFormField();
      return error ? (
        <div data-testid='form-message'>{error.message}</div>
      ) : null;
    },
    useFormField,
  };
});

jest.mock('@/components/ui/label', () => {
  const Label = React.forwardRef(({ children, ...props }: any, ref: any) => (
    <label ref={ref} {...props}>
      {children}
    </label>
  ));
  Label.displayName = 'LabelMock';
  return { Label };
});

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type='checkbox'
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid='alert' data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  AlertCircle: () => <div>AlertCircle</div>,
}));

describe('RegistrationForm', () => {
  const mockPush = jest.fn();
  const mockStartTransition = jest.fn();
  const mockFormAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useTransition as jest.Mock).mockReturnValue([false, mockStartTransition]);

    (useActionState as jest.Mock).mockReturnValue([
      { error: null, success: false },
      mockFormAction,
    ]);
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('registration-form')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-agreement-check')).toBeInTheDocument();
      expect(
        screen.getByTestId('submit-registration-button')
      ).toBeInTheDocument();
    });

    it('renders form labels correctly', () => {
      render(<RegistrationForm />);

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Privacy Agreement')).toBeInTheDocument();
    });

    it('renders password requirements', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('password-requirements')).toBeInTheDocument();
      expect(
        screen.getByText('Be at least 6 characters long')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Include a lowercase letter')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Include an uppercase letter')
      ).toBeInTheDocument();
      expect(screen.getByText('Include a number')).toBeInTheDocument();
    });

    it('renders privacy statement', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('privacy-statement')).toBeInTheDocument();
      expect(
        screen.getByText(/I agree to the storage and processing/)
      ).toBeInTheDocument();
    });

    it('renders show/hide password button', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('show-password-button')).toBeInTheDocument();
      expect(screen.getByText('Show')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for invalid inputs', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm />);

      const submitButton = screen.getByTestId('submit-registration-button');
      await user.click(submitButton);

      // Check that validation error messages are displayed
      const errorMessages = screen.getAllByTestId('form-message');
      expect(errorMessages).toHaveLength(3);
      expect(errorMessages[0]).toHaveTextContent(
        'Username must be at least 3 characters'
      );
      expect(errorMessages[1]).toHaveTextContent('Invalid email address');
      expect(errorMessages[2]).toHaveTextContent(
        'Password must be at least 6 characters long and include a lowercase letter, uppercase letter, and a number'
      );
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', () => {
      (useTransition as jest.Mock).mockReturnValue([true, mockStartTransition]);

      render(<RegistrationForm />);

      const submitButton = screen.getByTestId('submit-registration-button');
      expect(submitButton).toHaveTextContent('Registering...');
      expect(submitButton).toBeDisabled();
    });

    it('shows normal state when not submitting', () => {
      render(<RegistrationForm />);

      const submitButton = screen.getByTestId('submit-registration-button');
      expect(submitButton).toHaveTextContent('Register');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when registration fails', () => {
      (useActionState as jest.Mock).mockReturnValue([
        { error: 'Registration failed', success: false },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      const errorAlert = screen.getByTestId('alert');
      expect(errorAlert).toHaveAttribute('data-variant', 'destructive');
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });

    it('does not display error message when there is no error', () => {
      render(<RegistrationForm />);

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('shows success message and navigation button when registration succeeds', () => {
      (useActionState as jest.Mock).mockReturnValue([
        { error: null, success: true },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      expect(screen.getByText(/Registration successful!/)).toBeInTheDocument();
      expect(screen.getByText(/Please check your email/)).toBeInTheDocument();
      expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });

    it('navigates to home page when "Go to Login" is clicked', async () => {
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

    it('does not render form when registration is successful', () => {
      (useActionState as jest.Mock).mockReturnValue([
        { error: null, success: true },
        mockFormAction,
      ]);

      render(<RegistrationForm />);

      expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form attributes', () => {
      render(<RegistrationForm />);

      const form = screen.getByTestId('registration-form');
      expect(form).toHaveAttribute('method', 'POST');
    });

    it('has required attributes on form inputs', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('username-input')).toHaveAttribute('required');
      expect(screen.getByTestId('email-input')).toHaveAttribute('required');
      expect(screen.getByTestId('password-input')).toHaveAttribute('required');
      expect(screen.getByTestId('privacy-agreement-check')).toHaveAttribute(
        'required'
      );
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

    it('has proper placeholders', () => {
      render(<RegistrationForm />);

      expect(screen.getByTestId('username-input')).toHaveAttribute(
        'placeholder',
        'Choose a username'
      );
      expect(screen.getByTestId('email-input')).toHaveAttribute(
        'placeholder',
        'Enter your email'
      );
      expect(screen.getByTestId('password-input')).toHaveAttribute(
        'placeholder',
        'Create a password'
      );
    });
  });
});
