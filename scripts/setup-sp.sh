# scripts/setup-sp.sh
#!/bin/bash
set -e  # Exit on any error

echo "============================================"
echo "Service Principal Setup for EventSphere"
echo "============================================"
echo ""

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
echo "✓ Using Subscription: $SUBSCRIPTION_ID"
echo ""

# Service Principal Configuration
SP_NAME="eventsphere-automation"
RESOURCE_GROUP="hvp-infra"
LOCATION="eastus"

echo "Creating Service Principal: $SP_NAME"
echo "This will take a few seconds..."
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

echo "Waiting for Azure AD propagation (30 seconds)..."
sleep 30

# Assign Contributor role at subscription level
echo "Assigning Contributor role at subscription level..."
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role "Contributor" \
  --scope "/subscriptions/$SUBSCRIPTION_ID" \
  > /dev/null

echo "✓ Contributor role assigned"
echo ""

# Create resource group if it doesn't exist
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo "Creating resource group: $RESOURCE_GROUP"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION" > /dev/null
    echo "✓ Resource group created"
else
    echo "✓ Resource group already exists"
fi
echo ""

# Assign Owner role at resource group level
echo "Assigning Owner role at resource group level..."
az role assignment create \
  --assignee "$CLIENT_ID" \
  --role "Owner" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  > /dev/null

echo "✓ Owner role assigned"
echo ""

# Wait for final propagation
echo "Waiting for permission propagation (30 seconds)..."
sleep 30

# Save credentials to file
CREDS_FILE="$HOME/eventsphere-credentials.txt"
cat > "$CREDS_FILE" << EOF
# EventSphere Service Principal Credentials
# Created: $(date)
# SAVE THESE VALUES - YOU CANNOT RETRIEVE THE SECRET AGAIN!

ARM_CLIENT_ID=$CLIENT_ID
ARM_CLIENT_SECRET=$CLIENT_SECRET
ARM_TENANT_ID=$TENANT_ID
ARM_SUBSCRIPTION_ID=$SUBSCRIPTION_ID

# Configuration
SERVICE_PRINCIPAL_NAME=$SP_NAME
RESOURCE_GROUP=$RESOURCE_GROUP
LOCATION=$LOCATION
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
echo "⚠️  IMPORTANT: Copy these credentials NOW!"
echo "   The client secret cannot be retrieved again."
echo ""
echo "💾 Download the credentials file:"
echo "   download $CREDS_FILE"
echo ""
