-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create elections table
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'abierta', -- 'abierta' or 'cerrada'
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create positions (cargos) table
CREATE TABLE cargos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slates (planchas) table
CREATE TABLE planchas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    logo TEXT, -- URL to logo image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE candidatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    foto TEXT, -- URL to candidate photo
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    plancha_id UUID NOT NULL REFERENCES planchas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cargo_id, plancha_id) -- One candidate per position per slate
);

-- Create voters table
CREATE TABLE votantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    ya_voto BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE votos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    votante_id UUID NOT NULL REFERENCES votantes(id) ON DELETE CASCADE,
    candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sospechoso BOOLEAN DEFAULT FALSE,
    motivo_sospecha TEXT,
    UNIQUE(votante_id, candidato_id) -- One vote per voter per candidate (enables slate multi-cargos)
);

-- Create indexes for better performance
CREATE INDEX idx_candidatos_cargo ON candidatos(cargo_id);
CREATE INDEX idx_candidatos_plancha ON candidatos(plancha_id);
CREATE INDEX idx_votantes_codigo ON votantes(codigo);
CREATE INDEX idx_votantes_ya_voto ON votantes(ya_voto);
CREATE INDEX idx_votos_votante ON votos(votante_id);
CREATE INDEX idx_votos_candidato ON votos(candidato_id);
CREATE INDEX idx_votos_cargo ON votos(cargo_id);

-- Enable Row Level Security
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for elections
CREATE POLICY "Allow public read access to elections" ON elections
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert to elections" ON elections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to elections" ON elections
    FOR UPDATE USING (true);

-- RLS Policies for cargos
CREATE POLICY "Allow public read access to cargos" ON cargos
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert to cargos" ON cargos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to cargos" ON cargos
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete from cargos" ON cargos
    FOR DELETE USING (true);

-- RLS Policies for planchas
CREATE POLICY "Allow public read access to planchas" ON planchas
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert to planchas" ON planchas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to planchas" ON planchas
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete from planchas" ON planchas
    FOR DELETE USING (true);

-- RLS Policies for candidatos
CREATE POLICY "Allow public read access to candidatos" ON candidatos
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert to candidatos" ON candidatos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to candidatos" ON candidatos
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete from candidatos" ON candidatos
    FOR DELETE USING (true);

-- RLS Policies for votantes
CREATE POLICY "Allow public read access to votantes by code" ON votantes
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert to votantes" ON votantes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin update to votantes" ON votantes
    FOR UPDATE USING (true);

CREATE POLICY "Allow admin delete from votantes" ON votantes
    FOR DELETE USING (true);

-- RLS Policies for votos
CREATE POLICY "Allow public insert to votos" ON votos
    FOR INSERT WITH CHECK (
        -- Ensure voter hasn't already voted for this position
        NOT EXISTS (
            SELECT 1 FROM votos v
            WHERE v.votante_id = votos.votante_id
            AND v.cargo_id = votos.cargo_id
        )
    );

CREATE POLICY "Allow public read access to votos for results" ON votos
    FOR SELECT USING (true);

CREATE POLICY "Allow public delete from votos" ON votos
    FOR DELETE USING (true);

-- Create function to update voter status
CREATE OR REPLACE FUNCTION mark_voter_as_voted(voter_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE votantes SET ya_voto = TRUE, updated_at = NOW()
    WHERE id = voter_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark voter as voted after voting
CREATE OR REPLACE FUNCTION trigger_mark_voter_voted()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM mark_voter_as_voted(NEW.votante_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_vote_insert
    AFTER INSERT ON votos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_mark_voter_voted();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cargos_updated_at BEFORE UPDATE ON cargos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planchas_updated_at BEFORE UPDATE ON planchas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidatos_updated_at BEFORE UPDATE ON candidatos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votantes_updated_at BEFORE UPDATE ON votantes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data (two slates)
INSERT INTO planchas (nombre, color) VALUES
    ('Plancha 1', '#3B82F6'), -- Blue
    ('Plancha 2', '#EF4444'); -- Red

-- Insert default positions
INSERT INTO cargos (nombre, orden) VALUES
    ('Presidente', 1),
    ('Secretaria', 2),
    ('Vocal', 3),
    ('Asesor', 4);
