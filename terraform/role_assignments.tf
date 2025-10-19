# Storage Blob Data Contributor role for eventsphere-automation
resource "azurerm_role_assignment" "sp_storage_blob" {
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = data.azurerm_client_config.current.object_id
  
  depends_on = [
    azurerm_storage_account.storage
  ]
}
