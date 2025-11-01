#!/bin/bash
set -e

echo "============================================"
echo "Service Principal Setup for EventSphere"
echo "Database User"
echo "============================================"
echo ""

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
echo "✓ Using Subscription: $SUBSCRIPTION_ID"
echo ""

# Service Principal Configuration
SP_NAME="eventsphere-db-user"  # Changed name to reflect purpose
RESOURCE_GROUP="hvp-infra"
LOCATION="eastus"

echo "Creating Service Principal: $SP_NAME"
echo "This will be used as a DATABASE USER"
echo ""

# Create Service Principal and capture credentials
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "$SP_NAME" \
  --years 2 \
  --skip-assignment)

# Extract values from JSON output
CLIENT_ID=$(echo $SP_OUTPUT | jq -r '.appId')
CLIENT_SECRET=$(echo $SP_OUTPUT | jq -r '.password')
TENANT_ID=$(echo $SP_OUTPUT | jq -r '.tenant')

echo "✓ Service Principal Created"
echo ""

echo "Waiting for Azure AD propagation (20 seconds)..."
sleep 20

# Get Service Principal Object ID
SP_OBJECT_ID=$(az ad sp show --id "$CLIENT_ID" --query id --output tsv)
echo "✓ Service Principal Object ID: $SP_OBJECT_ID"
echo ""

# Assign Contributor role at resource group level ONLY
# This allows managing resources but NOT setting SQL admin
echo "Assigning Contributor role at resource group level..."
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  2>/dev/null || echo "✓ Contributor role already assigned"

echo "✓ Contributor role processed"
echo ""

# Wait for final propagation
echo "Waiting for permission propagation (10 seconds)..."
sleep 10

# Save credentials to file
CREDS_FILE="$HOME/eventsphere-db-credentials.txt"
cat > "$CREDS_FILE" << EOF
# EventSphere Service Principal Credentials (Database User)
# Created: $(date)
# SAVE THESE VALUES - YOU CANNOT RETRIEVE THE SECRET AGAIN!

ARM_CLIENT_ID=$CLIENT_ID
ARM_CLIENT_SECRET=$CLIENT_SECRET
ARM_TENANT_ID=$TENANT_ID
ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
SP_OBJECT_ID=$SP_OBJECT_ID

# Configuration
SERVICE_PRINCIPAL_NAME=$SP_NAME
RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION

# Database Configuration
SQL_SERVER_NAME=eventsphere-sql-centralindia-01
DATABASE_NAME=eventsphere

EOF

echo "============================================"
echo "✓ SETUP COMPLETE!"
echo "============================================"
echo ""
echo "📋 Credentials saved to: $CREDS_FILE"
echo ""
echo "🔑 Your Service Principal Credentials:"
echo "----------------------------------------"
cat "$CREDS_FILE"
echo "----------------------------------------"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Set YOUR user account as SQL Server AD admin:"
echo "   az sql server ad-admin create \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --server-name eventsphere-sql-centralindia-01 \\"
echo "     --display-name 'Your Name' \\"
echo "     --object-id \$(az ad signed-in-user show --query id -o tsv)"
echo ""
echo "2. Connect to database and create user for this SP:"
echo "   CREATE USER [${SP_NAME}] FROM EXTERNAL PROVIDER;"
echo "   ALTER ROLE db_datareader ADD MEMBER [${SP_NAME}];"
echo "   ALTER ROLE db_datawriter ADD MEMBER [${SP_NAME}];"
echo "   ALTER ROLE db_ddladmin ADD MEMBER [${SP_NAME}];"
echo ""
echo "⚠️  IMPORTANT: Copy these credentials NOW!"
echo "   The client secret cannot be retrieved again."
echo ""
