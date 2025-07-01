/// <reference types="cypress" />
// Auth Flows Integration Tests for Family Photos App
// Covers: Guest, Member, Admin authentication and access

const unique: string = Math.random().toString().substring(0, 5);

describe('Authentication Flows', () => {
  const adminEmail = `+cypress+${unique}admin@toman.me.uk`;
  const username = `testuser${unique}`;
  const memberEmail = `+cypress+${unique}@example.com`;
  const password = 'Password123';

  beforeEach(() => {
    cy.visit('/');
  });

  after(() => {
    cy.task('deleteTestUsers');
  });

  it('allows guest to access public photos but not family-only content or dashboard', () => {
    cy.get('[data-testid="continue-as-guest-button"]').click();
    cy.url().should('include', '/albums');
    cy.get('header').should('not.contain', 'Dashboard');
    // Should not see family-only photos
    // e.g., cy.get('work out how to target this').should('not.exist');
  });

  it('registers a new member, requires email verification on login', () => {
    cy.contains('Register').click();
    cy.get('[data-testid="username-input"]').type(username);
    cy.get(
      '[data-testid="registration-form"] [data-testid="email-input"]'
    ).type(memberEmail);
    cy.get(
      '[data-testid="registration-form"] [data-testid="password-input"]'
    ).type(password);
    cy.get('[data-testid="privacy-agreement-check"]').click();
    cy.get('[data-testid="submit-registration-button"]').click();
    cy.get('[data-testid="registration-success-alert"]')
      .should('exist')
      .contains('Registration successful!');

    // Try to login before verification
    cy.get('[data-testid="login-form"] [data-testid="email-input"]').type(
      memberEmail
    );
    cy.get('[data-testid="login-form"] [data-testid="password-input"]').type(
      password
    );
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="login-error-message"]')
      .should('exist')
      .contains('Please verify your email before logging in');
  });

  describe('registers admin, requires email verification on login', () => {
    it('registers and logs in as admin', () => {
      cy.contains('Register').click();

      cy.get(
        '[data-testid="registration-form"] [data-testid="username-input"]'
      ).type('adminuser');
      cy.get(
        '[data-testid="registration-form"] [data-testid="email-input"]'
      ).type(adminEmail);
      cy.get(
        '[data-testid="registration-form"] [data-testid="password-input"]'
      ).type(password);
      cy.get('[data-testid="privacy-agreement-check"]').click();
      cy.get('[data-testid="submit-registration-button"]').click();
      cy.contains('Registration successful!').should('exist');

      cy.get('[data-testid="login-form"] [data-testid="email-input"]').type(
        adminEmail
      );
      cy.get('[data-testid="login-form"] [data-testid="password-input"]').type(
        password
      );
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="login-error-message"]')
        .should('exist')
        .contains('Please verify your email before logging in');
    });
  });
});
