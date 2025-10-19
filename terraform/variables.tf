# terraform/variables.tf
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

variable "sql_server_name" {
  description = "Azure SQL Server name (must be globally unique)"
  type        = string
}

variable "sql_database_name" {
  description = "Azure SQL Database name"
  type        = string
}

variable "sql_admin_login" {
  description = "SQL Server administrator login"
  type        = string
  default     = "sqladmin"
}

variable "sql_admin_password" {
  description = "SQL Server administrator password (use strong password)"
  type        = string
  sensitive   = true
}
