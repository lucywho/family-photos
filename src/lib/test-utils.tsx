import { render as rtlRender } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { UserRole } from '@prisma/client';

const adminEmail = `admin@${process.env.ADMIN_EMAIL_DOMAIN}`;

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'MEMBER' as UserRole,
};

export const mockAdminUser = {
  ...mockUser,
  email: adminEmail,
  role: 'ADMIN' as UserRole,
};

export const mockGuestUser = {
  ...mockUser,
  role: 'GUEST' as UserRole,
};

// Custom render function that wraps with SessionProvider
export function render(
  ui: React.ReactElement,
  { session = null, ...options } = {}
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <SessionProvider session={session}>{children}</SessionProvider>
    ),
    ...options,
  });
}

// Mock HTMLFormElement.prototype.requestSubmit
const mockRequestSubmit = jest
  .fn()
  .mockImplementation(function (this: HTMLFormElement) {
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(submitEvent);
    return Promise.resolve();
  });

Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  writable: true,
  value: mockRequestSubmit,
});

// Custom submitForm utility
export async function submitForm(form: HTMLFormElement) {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);

  // Wait for any async operations to complete
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Export everything else from RTL except render (since we're overriding it)
export {
  cleanup,
  act,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
  getByRole,
  getByText,
  getByLabelText,
  getByPlaceholderText,
  getByTestId,
  getByDisplayValue,
  getByAltText,
  getByTitle,
  getAllByRole,
  getAllByText,
  getAllByLabelText,
  getAllByPlaceholderText,
  getAllByTestId,
  getAllByDisplayValue,
  getAllByAltText,
  getAllByTitle,
  queryByRole,
  queryByText,
  queryByLabelText,
  queryByPlaceholderText,
  queryByTestId,
  queryByDisplayValue,
  queryByAltText,
  queryByTitle,
  queryAllByRole,
  queryAllByText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByTestId,
  queryAllByDisplayValue,
  queryAllByAltText,
  queryAllByTitle,
  findByRole,
  findByText,
  findByLabelText,
  findByPlaceholderText,
  findByTestId,
  findByDisplayValue,
  findByAltText,
  findByTitle,
  findAllByRole,
  findAllByText,
  findAllByLabelText,
  findAllByPlaceholderText,
  findAllByTestId,
  findAllByDisplayValue,
  findAllByAltText,
  findAllByTitle,
} from '@testing-library/react';
