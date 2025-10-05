# terraform/output.tf
output "service_principal_client_id" {
  description = "Client ID (Application ID) of the created service principal"
  value       = azuread_application.app.client_id
}

output "service_principal_object_id" {
  description = "Object ID of the created service principal"
  value       = azuread_service_principal.app.object_id
}

output "service_principal_password" {
  description = "Generated password for the service principal (rotates every 30 days)"
  value       = azuread_service_principal_password.app.value
  sensitive   = true  # Hides it in non-raw output for security
}

output "service_principal_tenant_id" {
  description = "Azure AD tenant ID"
  value       = data.azurerm_client_config.current.tenant_id
}

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

output "postgres_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "database_name" {
  description = "PostgreSQL database name"
  value       = azurerm_postgresql_flexible_server_database.eventsphere.name
}

output "postgres_connection_command" {
  description = "Command to connect to PostgreSQL using Entra ID"
  value       = "psql \"host=${azurerm_postgresql_flexible_server.postgres.fqdn} port=5432 dbname=${azurerm_postgresql_flexible_server_database.eventsphere.name} user=${data.azurerm_client_config.current.client_id} sslmode=require\""
}
