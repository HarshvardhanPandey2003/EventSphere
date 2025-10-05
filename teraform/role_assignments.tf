//terraform/role_assignments.tf
resource "azurerm_role_assignment" "sp_contributor" {
  scope                = data.azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.app.object_id
  depends_on           = [azuread_service_principal.app] // means the SP must exist first
}

resource "azurerm_role_assignment" "sp_storage_blob" {
  scope                = azurerm_storage_account.storage.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azuread_service_principal.app.object_id
  depends_on           = [
    azuread_service_principal.app,
    azurerm_storage_account.storage
  ]
}

resource "azurerm_role_assignment" "sp_reader" {
  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Reader"
  principal_id         = azuread_service_principal.app.object_id
  depends_on           = [azuread_service_principal.app]
}
