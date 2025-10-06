// backend/scripts/migrate.js
import { exec } from 'child_process';
import { promisify } from 'util';
import { DefaultAzureCredential } from '@azure/identity';

const execAsync = promisify(exec);

// Local database config
const LOCAL = {
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'eventsphere'
};

// Azure database config
const AZURE = {
  host: 'eventsphere-pg-centralindia-01.postgres.database.azure.com',
  user: '604bb113-3a29-46ee-ba74-4cfe5cd684c4',
  database: 'eventsphere'
};

async function getAzureToken() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(
    'https://ossrdbms-aad.database.windows.net/.default'
  );
  return token.token;
}

async function migrate() {
  try {
    console.log('🚀 Starting migration...\n');
    
    // 1. Dump local database
    console.log('📦 Dumping local database...');
    await execAsync(
      `PGPASSWORD=${LOCAL.password} pg_dump ` +
      `-h ${LOCAL.host} -U ${LOCAL.user} -d ${LOCAL.database} ` +
      `-Fc -f backup.dump`
    );
    console.log('✓ Dump complete\n');
    
    // 2. Get Azure token
    console.log('🔑 Getting Azure token...');
    const token = await getAzureToken();
    console.log('✓ Token acquired\n');
    
    // 3. Restore to Azure
    console.log('☁️  Restoring to Azure...');
    await execAsync(
      `PGPASSWORD="${token}" pg_restore ` +
      `-h ${AZURE.host} -U ${AZURE.user} -d ${AZURE.database} ` +
      `--no-owner --no-privileges -v backup.dump`
    );
    console.log('✓ Restore complete\n');
    
    // 4. Verify
    console.log('🔍 Verifying...');
    const { stdout } = await execAsync(
      `PGPASSWORD="${token}" psql ` +
      `-h ${AZURE.host} -U ${AZURE.user} -d ${AZURE.database} ` +
      `-c "\\dt"`
    );
    console.log(stdout);
    
    console.log('✅ Migration successful!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrate();
