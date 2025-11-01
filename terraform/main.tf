# terraform/main.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.0"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "azuread" {
  tenant_id = data.azurerm_client_config.current.tenant_id
}

# Get current client configuration (service principal when running terraform)
data "azurerm_client_config" "current" {}

# Get subscription information
data "azurerm_subscription" "current" {}

# Reference existing resource group
data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
