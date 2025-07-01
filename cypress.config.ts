const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on, config) {
      on('task', {
        async deleteTestUsers() {
          await prisma.user.deleteMany({
            where: {
              email: { contains: '+cypress+' },
            },
          });
          return null;
        },
      });
    },
  },
});
