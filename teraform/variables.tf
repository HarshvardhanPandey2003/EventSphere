// variables.tf
variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "Existing resource group name"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "storage_account_name" {
  description = "Storage account name for event images (must be globally unique)"
  type        = string
}

variable "postgres_server_name" {
  description = "PostgreSQL Flexible Server name (must be globally unique)"
  type        = string
}

variable "postgres_database_name" {
  description = "PostgreSQL database name"
  type        = string
}
variable "postgres_location" {
  description = "Azure region for PostgreSQL (Central India for quota availability)"
  type        = string
  default     = "centralindia"
}
variable "service_principal_name" {
  description = "Display name for the service principal"
  type        = string
}
