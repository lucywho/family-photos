import '@testing-library/jest-dom';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  submitForm,
} from '@/lib/test-utils';
import { signIn } from 'next-auth/react';
import { LoginForm } from '@/components/auth/LoginForm';

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

//TODO: add test ids and labels to form
describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form fields', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('renders form labels correctly', () => {
      render(<LoginForm />);
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      render(<LoginForm />);

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid credentials', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({
        error: 'Invalid credentials',
      });
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpass' },
      });

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'wrong@example.com',
          password: 'wrongpass',
          redirect: false,
        });
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle unverified email', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({
        error: 'Email not verified',
      });
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'unverified@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'StrongPass123' },
      });

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalled();
        expect(screen.getByText(/email not verified/i)).toBeInTheDocument();
      });
    });

    it('should handle locked account', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Account locked' });
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'locked@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'StrongPass123' },
      });

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalled();
        expect(screen.getByText(/account locked/i)).toBeInTheDocument();
      });
    });
  });

  describe('Successful login behaviour', () => {
    it('should successfully log in a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER' as const,
      };
      (signIn as jest.Mock).mockResolvedValueOnce({ ok: true, user: mockUser });
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: mockUser.email },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'StrongPass123' },
      });

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: mockUser.email,
          password: 'StrongPass123',
          redirect: false,
        });
      });
    });

    it('should handle guest access', async () => {
      const mockGuestUser = {
        id: 'guest',
        email: 'guest@family-photos.app',
        name: 'Guest User',
        role: 'GUEST' as const,
      };
      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: true,
        user: mockGuestUser,
      });
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'guest@family-photos.app' },
      });

      const form = screen.getByRole('form') as HTMLFormElement;
      await submitForm(form);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'guest@family-photos.app',
          redirect: false,
        });
      });
    });
  });
});
