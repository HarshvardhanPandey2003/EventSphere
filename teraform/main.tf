terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
    azuread = { source = "hashicorp/azuread", version = "~> 2.47" }
    time    = { source = "hashicorp/time",    version = "~> 0.9" }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "azuread" {}

data "azurerm_client_config" "current" {}
data "azurerm_subscription" "current" {}
data "azurerm_resource_group" "main" { name = var.resource_group_name }

resource "azuread_application" "app" {
  display_name = var.service_principal_name
}

resource "azuread_service_principal" "app" {
  client_id = azuread_application.app.client_id
  use_existing = false
}

resource "time_rotating" "month" { rotation_days = 30 }

resource "azuread_service_principal_password" "app" {
  service_principal_id = azuread_service_principal.app.id
  rotate_when_changed = { rotation = time_rotating.month.id }
}
