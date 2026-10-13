-- SSA-SDS Database Initialization Script
-- SQL Server 2016+

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'sds_db')
    CREATE DATABASE sds_db;
GO

USE sds_db;
GO

-- Clients table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'clients')
BEGIN
    CREATE TABLE clients (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ragione_sociale NVARCHAR(MAX) NOT NULL,
        codice_fiscale NVARCHAR(450) NULL,
        indirizzo NVARCHAR(MAX) NULL,
        citta NVARCHAR(MAX) NULL,
        provincia NVARCHAR(MAX) NULL,
        cap NVARCHAR(MAX) NULL,
        telefono NVARCHAR(MAX) NULL,
        email NVARCHAR(MAX) NULL,
        contatto NVARCHAR(MAX) NULL,
        note NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE UNIQUE INDEX IX_clients_codice_fiscale ON clients(codice_fiscale) WHERE codice_fiscale IS NOT NULL;
END
GO

-- Safety cards table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'safety_cards')
BEGIN
    CREATE TABLE safety_cards (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        client_id INT NOT NULL REFERENCES clients(Id) ON DELETE CASCADE,
        tipologia NVARCHAR(MAX) NOT NULL,
        titolo NVARCHAR(MAX) NOT NULL,
        numero_protocollo NVARCHAR(MAX) NULL,
        ente_emittitore NVARCHAR(MAX) NULL,
        data_rilascio DATETIME2 NULL,
        data_scadenza DATETIME2 NULL,
        validita_mesi INT NULL,
        stato NVARCHAR(MAX) NOT NULL DEFAULT 'NotExpired',
        frequenza_controllo NVARCHAR(MAX) NULL,
        osservazioni NVARCHAR(MAX) NULL,
        pdf_url NVARCHAR(MAX) NULL,
        llm_analyzed BIT NOT NULL DEFAULT 0,
        llm_raw_response NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_safety_cards_client_id ON safety_cards(client_id);
    CREATE INDEX IX_safety_cards_data_scadenza ON safety_cards(data_scadenza);
    CREATE INDEX IX_safety_cards_stato ON safety_cards(stato);
END
GO

-- Import histories table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'import_histories')
BEGIN
    CREATE TABLE import_histories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        file_name NVARCHAR(MAX) NOT NULL,
        file_type NVARCHAR(MAX) NOT NULL,
        client_id INT NULL REFERENCES clients(Id) ON DELETE SET NULL,
        records_imported INT NOT NULL DEFAULT 0,
        status NVARCHAR(MAX) NOT NULL DEFAULT 'Processing',
        error_message NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_import_histories_client_id ON import_histories(client_id);
END
GO

-- Notifications table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notifications')
BEGIN
    CREATE TABLE notifications (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        client_id INT NOT NULL REFERENCES clients(Id) ON DELETE CASCADE,
        card_id INT NULL REFERENCES safety_cards(Id) ON DELETE SET NULL,
        type NVARCHAR(MAX) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        is_read BIT NOT NULL DEFAULT 0,
        sent_date DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE INDEX IX_notifications_client_id ON notifications(client_id);
    CREATE INDEX IX_notifications_card_id ON notifications(card_id);
    CREATE INDEX IX_notifications_is_read ON notifications(is_read);
END
GO

-- Users table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(450) NOT NULL,
        password_hash NVARCHAR(MAX) NOT NULL,
        email NVARCHAR(MAX) NULL,
        role NVARCHAR(MAX) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        last_login DATETIME2 NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    CREATE UNIQUE INDEX IX_users_username ON users(username);
END
GO

-- Trigger to update updated_at (clients)
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_clients_updated_at')
BEGIN
    CREATE TRIGGER trg_clients_updated_at
    ON clients
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE c
        SET c.updated_at = GETDATE()
        FROM clients c
        INNER JOIN inserted i ON c.Id = i.Id;
    END
END
GO

-- Trigger to update updated_at (safety_cards)
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_safety_cards_updated_at')
BEGIN
    CREATE TRIGGER trg_safety_cards_updated_at
    ON safety_cards
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE s
        SET s.updated_at = GETDATE()
        FROM safety_cards s
        INNER JOIN inserted i ON s.Id = i.Id;
    END
END
GO

-- Trigger to update updated_at (users)
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trg_users_updated_at')
BEGIN
    CREATE TRIGGER trg_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE u
        SET u.updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.Id = i.Id;
    END
END
GO
