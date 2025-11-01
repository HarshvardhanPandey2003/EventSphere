import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { DefaultAzureCredential } from '@azure/identity';

// Azure AD Passwordless Configuration
const config = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  authentication: {
    type: 'azure-active-directory-default',
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const adapter = new PrismaMssql(config);

const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'error', 'warn'],
});

export default prisma;
