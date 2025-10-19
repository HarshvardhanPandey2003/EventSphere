# terraform/main.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# Get current client configuration (eventsphere-automation SP)
data "azurerm_client_config" "current" {}

# Get subscription information
data "azurerm_subscription" "current" {}

# Reference existing resource group
data "azurerm_resource_group" "main" { 
  name = var.resource_group_name 
}
