# terraform/azuresql.tf
resource "azurerm_mssql_server" "sql" {
  name                         = var.sql_server_name
  resource_group_name          = data.azurerm_resource_group.main.name
  location                     = var.location  # East US
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"

  # Set the service principal as Azure AD admin
  azuread_administrator {
    login_username              = "eventsphere-automation"
    object_id                   = data.azurerm_client_config.current.object_id
    tenant_id                   = data.azurerm_client_config.current.tenant_id
    azuread_authentication_only = false  # Allow both SQL and Azure AD auth
  }

  # Enable system-assigned managed identity for Azure AD integration
  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

resource "azurerm_mssql_database" "eventsphere" {
  name           = var.sql_database_name
  server_id      = azurerm_mssql_server.sql.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  sku_name       = "Basic"
  max_size_gb    = 2
  zone_redundant = false

  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

# Allow Azure services to access the SQL server
resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Allow local development IP
resource "azurerm_mssql_firewall_rule" "allow_local_dev" {
  name             = "allow-local-dev"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "103.10.226.1"
  end_ip_address   = "103.10.226.1"
}
