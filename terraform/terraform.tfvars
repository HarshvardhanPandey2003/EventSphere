# terraform/terraform.tfvars

subscription_id      = "e28a91e8-0909-4a14-9f2d-45db5b903a50"
resource_group_name  = "hvp-infra"
location             = "centralindia"

# Storage Configuration
storage_account_name = "eventsphereimages01"

# SQL Server Configuration
sql_server_name   = "eventsphere-sql-centralindia-01"
sql_database_name = "eventsphere-db"

# ✅ YOUR Object ID (from PowerShell output earlier)
sql_admin_object_id = "2b2df636-825d-4d9d-b40d-01b53c8319cf"

# SQL Authentication (emergency access)
sql_admin_login    = "sqladmin"
sql_admin_password = "EventSphere@Secure2025!"
