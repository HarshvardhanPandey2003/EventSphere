# terraform/azuresql.tf

# Data source to get your current public IP
data "http" "myip" {
  url = "https://api.ipify.org?format=text"
}

# ✅ Look up your Azure AD user by Object ID (more reliable for external accounts)
data "azuread_user" "sql_admin" {
  object_id = var.sql_admin_object_id
}

resource "azurerm_mssql_server" "sql" {
  name                         = var.sql_server_name
  resource_group_name          = data.azurerm_resource_group.main.name
  location                     = var.location
  version                      = "12.0"
  minimum_tls_version          = "1.2"

  # Set YOUR personal account as Azure AD admin
  azuread_administrator {
    login_username              = data.azuread_user.sql_admin.user_principal_name
    object_id                   = data.azuread_user.sql_admin.object_id
    tenant_id                   = data.azurerm_client_config.current.tenant_id
    azuread_authentication_only = false  # Allow both Azure AD AND SQL auth
  }

  # SQL Server admin credentials (for emergency access via SQL auth)
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password

  # Enable system-assigned managed identity
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

# Automatically allow your current machine's public IP
resource "azurerm_mssql_firewall_rule" "allow_my_ip" {
  name             = "allow-my-current-ip"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = data.http.myip.response_body
  end_ip_address   = data.http.myip.response_body
}
