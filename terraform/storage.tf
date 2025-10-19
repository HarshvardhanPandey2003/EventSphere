# terraform/storage.tf
resource "azurerm_storage_account" "storage" {
  name                     = var.storage_account_name
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = var.location  # East US
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

resource "azurerm_storage_container" "images" {
  name                  = "event-images"
  storage_account_id    = azurerm_storage_account.storage.id
  container_access_type = "blob"
}
