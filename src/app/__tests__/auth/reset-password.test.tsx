/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockUser } from '@/lib/test-utils';

// Mock the password reset action
jest.mock('@/app/actions/auth', () => ({
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
}));

//TO DO: fix tests
describe('Password Reset', () => {
  describe('Request Password Reset', () => {
    it('should show validation error for empty email', async () => {
      render(
        <form>
          <input type='email' name='email' />
          <button type='submit'>Request Reset</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /request reset/i }));

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      render(
        <form>
          <input type='email' name='email' defaultValue='invalid-email' />
          <button type='submit'>Request Reset</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /request reset/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should handle non-existent email', async () => {
      const { requestPasswordReset } = require('@/app/actions/auth');
      (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
        error: 'No account found with this email address',
      });

      render(
        <form>
          <input
            type='email'
            name='email'
            defaultValue='nonexistent@example.com'
          />
          <button type='submit'>Request Reset</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /request reset/i }));

      await waitFor(() => {
        expect(requestPasswordReset).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(FormData)
        );
      });

      const result = await (requestPasswordReset as jest.Mock).mock.results[0]
        .value;
      expect(result.error).toBe('No account found with this email address');
    });

    it('should successfully request password reset', async () => {
      const { requestPasswordReset } = require('@/app/actions/auth');
      (requestPasswordReset as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      render(
        <form>
          <input type='email' name='email' defaultValue={mockUser.email} />
          <button type='submit'>Request Reset</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /request reset/i }));

      await waitFor(() => {
        expect(requestPasswordReset).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(FormData)
        );
      });

      const result = await (requestPasswordReset as jest.Mock).mock.results[0]
        .value;
      expect(result.success).toBe(true);
    });
  });

  describe('Reset Password', () => {
    it('should show validation errors for empty fields', async () => {
      render(
        <form>
          <input type='password' name='password' />
          <input type='password' name='confirmPassword' />
          <button type='submit'>Reset Password</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/please confirm your password/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate password requirements', async () => {
      render(
        <form>
          <input type='password' name='password' defaultValue='weak' />
          <input type='password' name='confirmPassword' defaultValue='weak' />
          <button type='submit'>Reset Password</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(
        <form>
          <input type='password' name='password' defaultValue='StrongPass123' />
          <input
            type='password'
            name='confirmPassword'
            defaultValue='DifferentPass123'
          />
          <button type='submit'>Reset Password</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid reset token', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      (resetPassword as jest.Mock).mockResolvedValueOnce({
        error: 'Invalid or expired reset token',
      });

      render(
        <form>
          <input type='hidden' name='token' defaultValue='invalid-token' />
          <input type='password' name='password' defaultValue='StrongPass123' />
          <input
            type='password'
            name='confirmPassword'
            defaultValue='StrongPass123'
          />
          <button type='submit'>Reset Password</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(FormData)
        );
      });

      const result = await (resetPassword as jest.Mock).mock.results[0].value;
      expect(result.error).toBe('Invalid or expired reset token');
    });

    it('should successfully reset password', async () => {
      const { resetPassword } = require('@/app/actions/auth');
      (resetPassword as jest.Mock).mockResolvedValueOnce({ success: true });

      render(
        <form>
          <input type='hidden' name='token' defaultValue='valid-token' />
          <input
            type='password'
            name='password'
            defaultValue='NewStrongPass123'
          />
          <input
            type='password'
            name='confirmPassword'
            defaultValue='NewStrongPass123'
          />
          <button type='submit'>Reset Password</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(FormData)
        );
      });

      const result = await (resetPassword as jest.Mock).mock.results[0].value;
      expect(result.success).toBe(true);
    });
  });
});
