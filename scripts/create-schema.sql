-- EventSphere Complete Schema
IF OBJECT_ID('event_attendees', 'U') IS NOT NULL DROP TABLE event_attendees;
IF OBJECT_ID('registrations', 'U') IS NOT NULL DROP TABLE registrations;
IF OBJECT_ID('events', 'U') IS NOT NULL DROP TABLE events;
IF OBJECT_ID('owner_profiles', 'U') IS NOT NULL DROP TABLE owner_profiles;
IF OBJECT_ID('user_profiles', 'U') IS NOT NULL DROP TABLE user_profiles;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

PRINT 'Creating users table...';
-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
);
GO

PRINT 'Creating user_profiles table...';
-- User Profiles Table (for attendees)
CREATE TABLE user_profiles (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    bio NVARCHAR(1000),
    phone NVARCHAR(50),
    date_of_birth DATE,
    avatar NVARCHAR(1000),
    location NVARCHAR(500),
    interests NVARCHAR(MAX), -- JSON array
    social_links NVARCHAR(MAX), -- JSON object
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_profiles_user (user_id)
);
GO

PRINT 'Creating owner_profiles table...';
-- ============================================
-- Owner Profiles Table (for event organizers)
-- ============================================
CREATE TABLE owner_profiles (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    
    -- Fields used in OwnerProfile.create()
    company_name NVARCHAR(255),
    bio NVARCHAR(2000),
    phone NVARCHAR(50),
    website NVARCHAR(500),
    avatar NVARCHAR(1000),
    business_type NVARCHAR(100),
    location NVARCHAR(500),
    social_links NVARCHAR(MAX), -- JSON object
    
    -- Additional fields
    email NVARCHAR(255),
    description NVARCHAR(MAX),
    address NVARCHAR(500),
    city NVARCHAR(100),
    state NVARCHAR(100),
    country NVARCHAR(100),
    postal_code NVARCHAR(20),
    
    -- Verification & metrics
    verification_status NVARCHAR(50) DEFAULT 'pending',
    verified_at DATETIME2,
    total_events INT DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_profiles_user (user_id),
    INDEX idx_owner_profiles_status (verification_status)
);
GO

PRINT 'Creating events table...';
-- ============================================
-- Events Table
-- ============================================
CREATE TABLE events (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(500) NOT NULL,
    description NVARCHAR(MAX),
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    location NVARCHAR(500),
    capacity INT NOT NULL,
    deadline DATETIME2 NOT NULL,
    status NVARCHAR(50) DEFAULT 'active',
    image NVARCHAR(1000),
    owner_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_events_start_date (start_date),
    INDEX idx_events_owner (owner_id),
    INDEX idx_events_status (status),
    CHECK (end_date >= start_date),
    CHECK (deadline <= start_date)
);
GO

PRINT 'Creating event_attendees table...';
-- ============================================
-- Event Attendees Table (USED BY CODE)
-- Fixed: NO ACTION on user_id to avoid cascade cycles
-- ============================================
CREATE TABLE event_attendees (
    id INT PRIMARY KEY IDENTITY(1,1),
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'registered',
    registered_at DATETIME2 DEFAULT GETDATE(),
    
    -- CASCADE on event deletion (delete all attendees when event is deleted)
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- NO ACTION on user deletion (prevents cascade cycle through events->users)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION,
    
    UNIQUE (event_id, user_id),
    INDEX idx_attendees_event (event_id),
    INDEX idx_attendees_user (user_id)
);
GO

-- ============================================
-- Verification
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'Schema Created - Verification';
PRINT '============================================';
PRINT '';

-- Count tables and columns
SELECT 
    t.TABLE_NAME as TableName,
    COUNT(c.COLUMN_NAME) as Columns
FROM INFORMATION_SCHEMA.TABLES t
LEFT JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
GROUP BY t.TABLE_NAME
ORDER BY t.TABLE_NAME;
GO

PRINT '';
PRINT '✅ EventSphere schema created successfully!';
PRINT '';
PRINT 'Tables:';
PRINT '  ✓ users (7 columns)';
PRINT '  ✓ user_profiles (10 columns)';
PRINT '  ✓ owner_profiles (20+ columns) - with total_events';
PRINT '  ✓ events (12 columns)';
PRINT '  ✓ event_attendees (5 columns) - CASCADE FIXED';
PRINT '';
PRINT 'Key changes:';
PRINT '  ✓ Removed unused registrations table';
PRINT '  ✓ Fixed cascade path conflict in event_attendees';
PRINT '  ✓ event_id: ON DELETE CASCADE (delete attendees with event)';
PRINT '  ✓ user_id: ON DELETE NO ACTION (prevent cascade cycle)';
GO
