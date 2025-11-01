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
  default     = "centralindia"
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

# ✅ CHANGED: Use Object ID instead of email (works for external accounts)
variable "sql_admin_object_id" {
  description = "Azure AD user Object ID for SQL Server admin (your personal account)"
  type        = string
}

# SQL authentication credentials (optional fallback)
variable "sql_admin_login" {
  description = "SQL Server administrator login (optional fallback)"
  type        = string
  default     = "sqladmin"
}

variable "sql_admin_password" {
  description = "SQL Server administrator password (use strong password)"
  type        = string
  sensitive   = true
}
