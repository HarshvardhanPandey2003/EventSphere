# terraform/output.tf
output "service_principal_info" {
  description = "Information about the service principal running Terraform"
  value = {
    client_id  = data.azurerm_client_config.current.client_id
    object_id  = data.azurerm_client_config.current.object_id
    tenant_id  = data.azurerm_client_config.current.tenant_id
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

output "sql_connection_string_aad" {
  description = "SQL connection string using Azure AD (Service Principal)"
  value       = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=${azurerm_mssql_database.eventsphere.name};Authentication=Active Directory Service Principal;User ID=${data.azurerm_client_config.current.client_id};Password=<CLIENT_SECRET>"
  sensitive   = true
}

output "sql_connection_string_admin" {
  description = "SQL connection string using SQL authentication"
  value       = "Server=tcp:${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=${azurerm_mssql_database.eventsphere.name};User ID=${var.sql_admin_login};Password=${var.sql_admin_password};Encrypt=yes;TrustServerCertificate=no;"
  sensitive   = true
}

# Storage Outputs
output "storage_account_name" {
  description = "Storage account name"
  value       = azurerm_storage_account.storage.name
}

output "blob_container_name" {
  description = "Blob container for images"
  value       = azurerm_storage_container.images.name
}

output "storage_primary_access_key" {
  description = "Storage account primary access key"
  value       = azurerm_storage_account.storage.primary_access_key
  sensitive   = true
}
