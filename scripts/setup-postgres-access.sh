#!/bin/bash
# setup-postgres-access.sh

# Configuration - Update these from your Terraform outputs
RESOURCE_GROUP="hvp-infra"
SERVER_NAME="eventsphere-pg-centralindia-01"
DATABASE_NAME="eventsphere"
SP_OBJECT_ID="bdc06691-0d98-475c-b95f-9c0c97a5d974"
SP_ROLE_NAME="eventsphere-app"

echo "🚀 Starting PostgreSQL Access Setup..."

# # Step 1: Get your public IP and add firewall rule
# echo -e "\n📍 Step 1: Adding firewall rule for your IP..."
# MY_IP="103.10.226.1"
# echo "   Your IP: $MY_IP"

# az postgres flexible-server firewall-rule create \
#   --resource-group $RESOURCE_GROUP \
#   --name $SERVER_NAME \
#   --rule-name "AllowMyIP" \
#   --start-ip-address $MY_IP \
#   --end-ip-address $MY_IP \
#   --output table

# # Step 2: Temporarily allow Azure services
# echo -e "\n🔓 Step 2: Temporarily allowing Azure services..."
# az postgres flexible-server firewall-rule create \
#   --resource-group $RESOURCE_GROUP \
#   --name $SERVER_NAME \
#   --rule-name "AllowAzureServices" \
#   --start-ip-address "0.0.0.0" \
#   --end-ip-address "0.0.0.0" \
#   --output table

# Step 3: Get access token
echo -e "\n🔑 Step 3: Getting access token..."
ACCESS_TOKEN=$(az account get-access-token --resource https://ossrdbms-aad.database.windows.net --query accessToken -o tsv)

# Step 4: Get current user
CURRENT_USER=$(az account show --query user.name -o tsv)
echo "   Admin User: $CURRENT_USER"

# Step 5: Create SQL script
echo -e "\n📝 Step 5: Creating service principal database user..."

cat > setup-sp.sql << EOF
-- Create service principal user
SELECT * FROM pgaadauth_create_principal_with_oid(
    '$SP_ROLE_NAME',
    '$SP_OBJECT_ID',
    'service',
    false,
    false
);

-- Grant all necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$SP_ROLE_NAME";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$SP_ROLE_NAME";
GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO "$SP_ROLE_NAME";
GRANT USAGE ON SCHEMA public TO "$SP_ROLE_NAME";
GRANT CREATE ON SCHEMA public TO "$SP_ROLE_NAME";

-- Verify the role was created
SELECT * FROM pgaadauth_list_principals(false);
EOF

# Step 6: Execute SQL commands
echo -e "\n🔧 Step 6: Executing SQL commands..."
export PGPASSWORD=$ACCESS_TOKEN

psql "host=$SERVER_NAME.postgres.database.azure.com port=5432 dbname=$DATABASE_NAME user=$CURRENT_USER sslmode=require" -f setup-sp.sql

if [ $? -eq 0 ]; then
    echo -e "\n✅ Service principal setup completed successfully!"
else
    echo -e "\n❌ Failed to setup service principal. Check errors above."
fi

# Step 7: Clean up
echo -e "\n🧹 Step 7: Cleaning up..."
rm -f setup-sp.sql

# Step 8: Remove Azure services access
echo -e "\n🔒 Step 8: Removing Azure services access..."
az postgres flexible-server firewall-rule delete \
  --resource-group $RESOURCE_GROUP \
  --name $SERVER_NAME \
  --rule-name "AllowAzureServices" \
  --yes \
  --output table

# Step 9: Display final firewall rules
echo -e "\n📋 Final firewall rules:"
az postgres flexible-server firewall-rule list \
  --resource-group $RESOURCE_GROUP \
  --name $SERVER_NAME \
  --output table

echo -e "\n✨ Setup complete!"
echo -e "\nNext steps:"
echo "1. Update .env.production with POSTGRES_USER=$SP_ROLE_NAME"
echo "2. Run: npm run prod"
echo "3. Your service principal can now connect to the database!"
