// terraform/postgres.tf
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                = var.postgres_server_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.postgres_location
  version             = "16"
  storage_mb          = 32768
  sku_name            = "B_Standard_B1ms"
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  # AAD-only authentication (NO passwords!)
  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = false  # Disable password auth completely
    tenant_id                     = data.azurerm_client_config.current.tenant_id
  }

  # NO administrator_login or administrator_password needed!
  lifecycle {
    ignore_changes = [
      zone,
      high_availability[0].standby_availability_zone
    ]
  }

  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

# Make the service principal the AAD admin
# This gives your app FULL admin access to the database
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "service_principal" {
  server_name         = azurerm_postgresql_flexible_server.postgres.name
  resource_group_name = data.azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = azuread_service_principal.app.object_id
  principal_name      = azuread_service_principal.app.display_name
  principal_type      = "ServicePrincipal"
  
  depends_on = [
    azuread_service_principal.app,
    azurerm_postgresql_flexible_server.postgres
  ]
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

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_local_dev" {
  name             = "allow-local-dev"
  server_id        = azurerm_postgresql_flexible_server.postgres.id
  start_ip_address = "103.10.226.1"
  end_ip_address   = "103.10.226.1"
}
