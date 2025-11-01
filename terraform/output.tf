# terraform/outputs.tf

# Service Principal Information
output "service_principal_info" {
  description = "Information about the service principal running Terraform"
  value = {
    client_id = data.azurerm_client_config.current.client_id
    object_id = data.azurerm_client_config.current.object_id
    tenant_id = data.azurerm_client_config.current.tenant_id
  }
}

# Azure SQL Outputs
output "sql_server_fqdn" {
  description = "Azure SQL Server FQDN"
  value       = azurerm_mssql_server.sql.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Azure SQL Database name"
  value       = azurerm_mssql_database.eventsphere.name
}

output "sql_admin_email" {
  description = "SQL Server Azure AD Admin Email"
  value       = data.azuread_user.sql_admin.user_principal_name
}

output "sql_connection_string_aad_sp" {
  description = "SQL connection string using Azure AD Service Principal (for Node.js app)"
  value       = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=${azurerm_mssql_database.eventsphere.name};Authentication=Active Directory Service Principal"
  sensitive   = false
}

output "sql_connection_string_sql_auth" {
  description = "SQL connection string using SQL authentication (emergency access)"
  value       = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=${azurerm_mssql_database.eventsphere.name};User ID=${var.sql_admin_login};Password=<PASSWORD>;Encrypt=yes;"
  sensitive   = true
}

# Storage Outputs
output "storage_account_name" {
  description = "Storage account name"
  value       = azurerm_storage_account.storage.name
}

output "storage_account_primary_endpoint" {
  description = "Storage account primary blob endpoint"
  value       = azurerm_storage_account.storage.primary_blob_endpoint
}

output "blob_container_images" {
  description = "Blob container for event images"
  value       = azurerm_storage_container.images.name
}

output "storage_connection_string" {
  description = "Storage account connection string"
  value       = azurerm_storage_account.storage.primary_connection_string
  sensitive   = true
}

output "storage_primary_access_key" {
  description = "Storage account primary access key"
  value       = azurerm_storage_account.storage.primary_access_key
  sensitive   = true
}

# Network Information
output "my_current_ip" {
  value       = data.http.myip.response_body
  description = "Your current public IP address that has been whitelisted"
}

# ✅ Instructions for next steps
output "next_steps" {
  description = "What to do after Terraform completes"
  value = <<-EOT
  
  ========================================
  ✅ Infrastructure Created Successfully!
  ========================================
  
  📋 NEXT STEPS:
  
  1. Grant Service Principal Database Access:
     - Go to Azure Portal → ${azurerm_mssql_database.eventsphere.name} → Query editor
     - Log in as: ${data.azuread_user.sql_admin.user_principal_name}
     - Run the SQL commands from setup-sp-db-access.sh
  
  2. Update your Node.js .env file:
     DB_SERVER=${azurerm_mssql_server.sql.fully_qualified_domain_name}
     DB_NAME=${azurerm_mssql_database.eventsphere.name}
     DB_AUTHENTICATION=azure-active-directory-service-principal-secret
     AZURE_CLIENT_ID=${data.azurerm_client_config.current.client_id}
     AZURE_CLIENT_SECRET=<from eventsphere-credentials.txt>
     AZURE_TENANT_ID=${data.azurerm_client_config.current.tenant_id}
     
     AZURE_STORAGE_ACCOUNT_NAME=${azurerm_storage_account.storage.name}
     AZURE_STORAGE_CONTAINER_NAME=${azurerm_storage_container.images.name}
     AZURE_STORAGE_CONNECTION_STRING=<use 'terraform output -raw storage_connection_string'>
  
  3. Test your connection:
     npm run dev
  
  ========================================
  EOT
}
