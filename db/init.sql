-- SSA-SDS Database Initialization Script
-- PostgreSQL 15+

-- Create database
CREATE DATABASE sds_db;

\c sds_db;

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    ragione_sociale VARCHAR(255) NOT NULL,
    codice_fiscale VARCHAR(20) UNIQUE,
    indirizzo VARCHAR(255),
    citta VARCHAR(100),
    provincia VARCHAR(10),
    cap VARCHAR(10),
    telefono VARCHAR(20),
    email VARCHAR(100),
    contatto VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Safety cards table
CREATE TABLE safety_cards (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tipologia VARCHAR(100) NOT NULL,
    titolo VARCHAR(255) NOT NULL,
    numero_protocollo VARCHAR(100),
    ente_emittitore VARCHAR(200),
    data_rilascio DATE,
    data_scadenza DATE,
    validita_mesi INTEGER,
    stato VARCHAR(20) NOT NULL DEFAULT 'NotExpired',
    frequenza_controllo VARCHAR(100),
    osservazioni TEXT,
    pdf_url VARCHAR(500),
    llm_analyzed BOOLEAN NOT NULL DEFAULT FALSE,
    llm_raw_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Import histories table
CREATE TABLE import_histories (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    records_imported INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Processing',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES safety_cards(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_safety_cards_client_id ON safety_cards(client_id);
CREATE INDEX idx_safety_cards_data_scadenza ON safety_cards(data_scadenza);
CREATE INDEX idx_safety_cards_stato ON safety_cards(stato);
CREATE INDEX idx_import_histories_client_id ON import_histories(client_id);
CREATE INDEX idx_notifications_client_id ON notifications(client_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_cards_updated_at BEFORE UPDATE ON safety_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate card status
CREATE OR REPLACE FUNCTION calculate_card_status(card_data_scadenza DATE)
RETURNS VARCHAR AS $$
BEGIN
    IF card_data_scadenza IS NULL THEN
        RETURN 'NotExpired';
    ELSIF card_data_scadenza < CURRENT_DATE THEN
        RETURN 'Expired';
    ELSIF card_data_scadenza < CURRENT_DATE + INTERVAL '30 days' THEN
        RETURN 'Expiring';
    ELSE
        RETURN 'Valid';
    END IF;
END;
$$ LANGUAGE plpgsql;
