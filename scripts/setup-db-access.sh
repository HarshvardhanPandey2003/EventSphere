#!/bin/bash
# create-db-user.sh

RESOURCE_GROUP="hvp-infra"
SQL_SERVER="eventsphere-sql-centralindia-01"
DATABASE="eventsphere"
SP_NAME="eventsphere-db-user"

echo "Creating database user via Azure CLI..."

# Get your access token
TOKEN=$(az account get-access-token --resource=https://database.windows.net/ --query accessToken -o tsv)

# SQL commands
SQL_COMMANDS="
DROP USER IF EXISTS [96a097af-2e63-4525-b8e4-aec525de6a83];
DROP USER IF EXISTS [eventsphere-automation];
DROP USER IF EXISTS [eventsphere-db-user];

CREATE USER [${SP_NAME}] FROM EXTERNAL PROVIDER;

ALTER ROLE db_datareader ADD MEMBER [${SP_NAME}];
ALTER ROLE db_datawriter ADD MEMBER [${SP_NAME}];
ALTER ROLE db_ddladmin ADD MEMBER [${SP_NAME}];
ALTER ROLE db_owner ADD MEMBER [${SP_NAME}];

SELECT name, type_desc, authentication_type_desc FROM sys.database_principals WHERE name = '${SP_NAME}';
"

# Execute using sqlcmd or az sql db query
az sql db show-connection-string --client sqlcmd --name "$DATABASE" --server "$SQL_SERVER" | \
  sed "s/<password>/$TOKEN/g" | \
  sed 's/<username>/YOUR_EMAIL/g'

echo "Paste the connection string and run the SQL commands manually"
