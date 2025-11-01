#!/bin/bash
# setup-sql-auth.sh

set -e

echo "============================================"
echo "EventSphere - SQL Authentication Setup"
echo "============================================"
echo ""

# Configuration
RESOURCE_GROUP="hvp-infra"
SQL_SERVER="eventsphere-sql-centralindia-01"
DATABASE="eventsphere-db"  
SQL_USER="eventsphere_app"
SQL_PASSWORD="EventSphere2024!Strong"

echo "Configuration:"
echo "  Server: $SQL_SERVER"
echo "  Database: $DATABASE"
echo "  User: $SQL_USER"
echo ""

# Generate SQL script
SQL_FILE="$HOME/create-sql-user.sql"

cat > "$SQL_FILE" << EOF
-- EventSphere SQL User Creation
-- Database: $DATABASE
-- Generated: $(date)

-- Step 1: Switch to master database
USE master;
GO

-- Step 2: Drop existing login if exists
IF EXISTS (SELECT * FROM sys.sql_logins WHERE name = '$SQL_USER')
BEGIN
    DROP LOGIN [$SQL_USER];
    PRINT '✓ Dropped existing login';
END
GO

-- Step 3: Create login
CREATE LOGIN $SQL_USER WITH PASSWORD = '$SQL_PASSWORD';
PRINT '✓ Login created';
GO

-- Step 4: Switch to eventsphere-db database
USE [$DATABASE];
GO

-- Step 5: Drop user if exists
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = '$SQL_USER')
BEGIN
    DROP USER [$SQL_USER];
    PRINT '✓ Dropped existing user';
END
GO

-- Step 6: Create user
CREATE USER $SQL_USER FOR LOGIN $SQL_USER;
PRINT '✓ User created';
GO

-- Step 7: Grant permissions
ALTER ROLE db_datareader ADD MEMBER $SQL_USER;
ALTER ROLE db_datawriter ADD MEMBER $SQL_USER;
ALTER ROLE db_ddladmin ADD MEMBER $SQL_USER;
PRINT '✓ Permissions granted';
GO

-- Step 8: Verify user creation
SELECT 
    name AS Username,
    type_desc AS Type,
    create_date AS Created
FROM sys.database_principals 
WHERE name = '$SQL_USER';
GO

-- Step 9: Verify roles
SELECT 
    dp.name AS Username,
    STRING_AGG(drole.name, ', ') WITHIN GROUP (ORDER BY drole.name) AS Roles
FROM sys.database_principals dp
LEFT JOIN sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
LEFT JOIN sys.database_principals drole ON drm.role_principal_id = drole.principal_id
WHERE dp.name = '$SQL_USER'
GROUP BY dp.name;
GO

PRINT '✓ User setup complete!';
EOF

echo "✓ SQL script generated: $SQL_FILE"
echo ""

# Generate .env file
ENV_FILE="$HOME/eventsphere-sql.env"

cat > "$ENV_FILE" << EOF
# EventSphere Backend - SQL Authentication
# Generated: $(date)

# Azure SQL Configuration
AZURE_SQL_SERVER=$SQL_SERVER.database.windows.net
AZURE_SQL_DATABASE=$DATABASE
AZURE_SQL_PORT=1433
AZURE_SQL_USER=$SQL_USER
AZURE_SQL_PASSWORD=$SQL_PASSWORD

# Application
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_here
EOF

echo "✓ Environment file generated: $ENV_FILE"
echo ""

echo "============================================"
echo "✓ Setup Complete!"
echo "============================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Go to Azure Portal Query Editor:"
echo "   https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Sql%2Fservers%2Fdatabases"
echo ""
echo "2. Navigate to: eventsphere-db → Query editor"
echo ""
echo "3. Sign in as: omspandey@hotmail.com"
echo ""
echo "4. Copy and run this file: $SQL_FILE"
echo "   cat $SQL_FILE"
echo ""
echo "5. Copy environment file to your backend:"
echo "   cp $ENV_FILE ~/path/to/backend/.env"
echo ""
echo "6. Test connection:"
echo "   npm run dev"
echo ""
echo "============================================"
echo ""
echo "View SQL Script:"
echo "----------------------------------------"
cat "$SQL_FILE"
echo "----------------------------------------"
echo ""
