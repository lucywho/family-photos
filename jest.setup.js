import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  getSession: jest.fn(() => Promise.resolve(null)),
  getProviders: jest.fn(() => Promise.resolve({})),
  SessionProvider: ({ children }) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';
process.env.ADMIN_EMAIL_DOMAIN = process.env.ADMIN_EMAIL_DOMAIN || '';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || '';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

// Mock fetch
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
