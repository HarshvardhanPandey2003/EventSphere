resource "azurerm_storage_account" "storage" {
  name                     = var.storage_account_name
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  allow_nested_items_to_be_public = false

  blob_properties {
    versioning_enabled = false
    delete_retention_policy { days = 7 }
  }

  tags = {
    environment = "development"
    project     = "eventsphere"
  }
}

resource "azurerm_storage_container" "images" {
  name                  = "event-images"
  storage_account_id    = azurerm_storage_account.storage.id
  container_access_type = "private"
}
