resource "azurerm_postgresql_flexible_server" "postgres" {
  name                = var.postgres_server_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.postgres_location  # Changed from var.location
  version             = "16"
  storage_mb          = 32768  # 32 GB (minimum allowed)
  sku_name            = "B_Standard_B1ms"  # 1 vCore, 2 GiB RAM (cheapest)
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = false
    tenant_id                     = data.azurerm_client_config.current.tenant_id
  }

  # For practice, you can comment out admin password if only using Entra ID
#   administrator_login    = "postgres"
#   administrator_password = "P@ssw0rd123!ComplexPassword"

  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

resource "azurerm_postgresql_flexible_server_active_directory_administrator" "current_user" {
  server_name         = azurerm_postgresql_flexible_server.postgres.name
  resource_group_name = data.azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = data.azurerm_client_config.current.object_id
  principal_name      = data.azurerm_client_config.current.client_id
  principal_type      = "User"
}

resource "azurerm_postgresql_flexible_server_active_directory_administrator" "service_principal" {
  server_name         = azurerm_postgresql_flexible_server.postgres.name
  resource_group_name = data.azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = azuread_service_principal.app.object_id
  principal_name      = azuread_service_principal.app.display_name
  principal_type      = "ServicePrincipal"
  depends_on = [azuread_service_principal.app]
}

resource "azurerm_postgresql_flexible_server_database" "eventsphere" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "dev_machine" {
  name             = "allow-dev-machine"
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = "0.0.0.0"  # Replace with your public IP for real use
  end_ip_address   = "0.0.0.0"
}
