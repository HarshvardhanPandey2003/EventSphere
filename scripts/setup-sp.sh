#!/bin/bash
set -e

echo "============================================"
echo "EventSphere - Service Principal Setup"
echo "For Database and Blob Storage Access"
echo "============================================"
echo ""

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
RESOURCE_GROUP="hvp-infra"
LOCATION="centralindia"
STORAGE_ACCOUNT="eventsphereimages01"
SQL_SERVER_NAME="eventsphere-sql-centralindia-01"
DATABASE_NAME="eventsphere"

SP_NAME="eventsphere-db-user"
CREDS_FILE="$HOME/eventsphere-db-credentials.txt"

# ------------------------------------------------------------
# Subscription Context
# ------------------------------------------------------------
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
echo "✓ Using Subscription: $SUBSCRIPTION_ID"
echo ""

# ------------------------------------------------------------
# Create Service Principal
# ------------------------------------------------------------
echo "Creating Service Principal: $SP_NAME"
echo "This SP will be used for both SQL DB and Blob Storage access"
echo ""

SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "$SP_NAME" \
  --years 2 \
  --skip-assignment)

# Extract credentials
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.appId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.password')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenant')

echo "✓ Service Principal Created"
echo ""

echo "Waiting for Azure AD propagation (20 seconds)..."
sleep 20

SP_OBJECT_ID=$(az ad sp show --id "$CLIENT_ID" --query id --output tsv)
echo "✓ Service Principal Object ID: $SP_OBJECT_ID"
echo ""

# ------------------------------------------------------------
# Assign Roles
# ------------------------------------------------------------
echo "Assigning roles..."
echo ""

# 1️⃣ Contributor Role at Resource Group
echo "→ Assigning 'Contributor' role at resource group level..."
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  2>/dev/null || echo "✓ Contributor role already assigned"
echo "✓ Contributor access processed"
echo ""

# 2️⃣ Storage Blob Data Contributor at Storage Account Level
STORAGE_ID="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT"

echo "→ Assigning 'Storage Blob Data Contributor' role for Storage Account..."
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role "Storage Blob Data Contributor" \
  --scope "$STORAGE_ID" \
  2>/dev/null || echo "✓ Storage Blob Data Contributor role already assigned"
echo "✓ Blob access role processed"
echo ""

# ------------------------------------------------------------
# Verify Assignments
# ------------------------------------------------------------
echo "Verifying role assignments..."
az role assignment list \
  --assignee "$CLIENT_ID" \
  --output table | grep -E "Contributor|Storage Blob Data Contributor" || true
echo ""

# ------------------------------------------------------------
# Save Credentials
# ------------------------------------------------------------
cat > "$CREDS_FILE" << EOF
# ============================================
# EventSphere Service Principal Credentials
# Created: $(date)
# ============================================

# Azure Authentication
ARM_CLIENT_ID=$CLIENT_ID
ARM_CLIENT_SECRET=$CLIENT_SECRET
ARM_TENANT_ID=$TENANT_ID
ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
SP_OBJECT_ID=$SP_OBJECT_ID

# Configuration
SERVICE_PRINCIPAL_NAME=$SP_NAME
RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION

# Database & Storage
SQL_SERVER_NAME=$SQL_SERVER_NAME
DATABASE_NAME=$DATABASE_NAME
STORAGE_ACCOUNT=$STORAGE_ACCOUNT
EOF

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------
echo "============================================"
echo "✅ SETUP COMPLETE!"
echo "============================================"
echo ""
echo "📋 Credentials saved to: $CREDS_FILE"
echo ""
echo "🔑 Service Principal:"
echo "   Name:     $SP_NAME"
echo "   Client ID: $CLIENT_ID"
echo "   Tenant ID: $TENANT_ID"
echo ""
echo "🧩 Roles assigned:"
echo "   • Contributor → Resource Group: $RESOURCE_GROUP"
echo "   • Storage Blob Data Contributor → $STORAGE_ACCOUNT"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1️⃣ Set your own account as SQL Server AD admin:"
echo "   az sql server ad-admin create \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --server-name $SQL_SERVER_NAME \\"
echo "     --display-name 'Your Name' \\"
echo "     --object-id \$(az ad signed-in-user show --query id -o tsv)"
echo ""
echo "2️⃣ Inside Azure SQL, create a user for this SP:"
echo "   CREATE USER [$SP_NAME] FROM EXTERNAL PROVIDER;"
echo "   ALTER ROLE db_datareader ADD MEMBER [$SP_NAME];"
echo "   ALTER ROLE db_datawriter ADD MEMBER [$SP_NAME];"
echo "   ALTER ROLE db_ddladmin ADD MEMBER [$SP_NAME];"
echo ""
echo "⚠️ The client secret will not be retrievable again."
echo "============================================"
