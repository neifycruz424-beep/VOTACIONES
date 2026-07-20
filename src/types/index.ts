export interface Election {
  id: string;
  nombre: string;
  estado: 'abierta' | 'cerrada';
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cargo {
  id: string;
  nombre: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Plancha {
  id: string;
  nombre: string;
  color: string;
  logo: string | null;
  eslogan?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidato {
  id: string;
  nombre: string;
  foto: string | null;
  cargo_id: string;
  plancha_id: string;
  created_at: string;
  updated_at: string;
  cargo?: Cargo;
  plancha?: Plancha;
}

export interface Votante {
  id: string;
  codigo: string;
  nombre: string;
  ya_voto: boolean;
  created_at: string;
  updated_at: string;
}

export interface Voto {
  id: string;
  votante_id: string;
  candidato_id: string;
  cargo_id: string;
  fecha: string;
  sospechoso?: boolean;
  motivo_sospecha?: string | null;
  candidato?: Candidato;
  votante?: Votante;
  cargo?: Cargo;
}

export interface VoteResult {
  candidato: Candidato;
  total_votos: number;
  porcentaje: number;
}

export interface PositionResults {
  cargo: Cargo;
  resultados: VoteResult[];
  total_votos: number;
}

export interface DashboardStats {
  total_votantes: number;
  total_votos: number;
  participacion: number;
  estado_eleccion: 'abierta' | 'cerrada';
}

export interface VoteSelection {
  cargo_id: string;
  candidato_id: string;
}

export interface VoteFormData {
  selections: VoteSelection[];
}
