import { supabase } from '../lib/supabase';
import type { Voto, VoteSelection, PositionResults, DashboardStats } from '../types';

export const votoService = {
  async submitVote(votanteId: string, selections: VoteSelection[]): Promise<void> {
    const votes = selections.map(selection => ({
      votante_id: votanteId,
      candidato_id: selection.candidato_id,
      cargo_id: selection.cargo_id,
    }));

    const { error } = await supabase
      .from('votos')
      .insert(votes);

    if (error) throw error;
  },

  async getVotesByCargo(cargoId: string): Promise<Voto[]> {
    const { data, error } = await supabase
      .from('votos')
      .select('*, candidato:candidatos(*), cargo:cargos(*)')
      .eq('cargo_id', cargoId);

    if (error) throw error;
    return data || [];
  },

  async getAllVotes(): Promise<Voto[]> {
    const { data, error } = await supabase
      .from('votos')
      .select('*, candidato:candidatos(*), cargo:cargos(*), votante:votantes(*)')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPositionResults(cargoId: string): Promise<PositionResults> {
    const votes = await this.getVotesByCargo(cargoId);
    
    const candidateVotes = new Map<string, number>();
    votes.forEach(vote => {
      const count = candidateVotes.get(vote.candidato_id) || 0;
      candidateVotes.set(vote.candidato_id, count + 1);
    });

    const totalVotes = votes.length;
    const resultados = Array.from(candidateVotes.entries()).map(([candidatoId, total]) => ({
      candidato: votes.find(v => v.candidato_id === candidatoId)?.candidato!,
      total_votos: total,
      porcentaje: totalVotes > 0 ? (total / totalVotes) * 100 : 0,
    })).sort((a, b) => b.total_votos - a.total_votos);

    const cargo = votes[0]?.cargo;
    
    return {
      cargo: cargo!,
      resultados,
      total_votos: totalVotes,
    };
  },

  async getAllResults(): Promise<PositionResults[]> {
    const { data: cargos, error } = await supabase
      .from('cargos')
      .select('*')
      .order('orden', { ascending: true });

    if (error) throw error;

    const results = await Promise.all(
      cargos?.map(cargo => this.getPositionResults(cargo.id)) || []
    );

    return results;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalVotantes, totalVotos, election] = await Promise.all([
      supabase.from('votantes').select('id', { count: 'exact', head: true }),
      supabase.from('votos').select('id', { count: 'exact', head: true }),
      supabase.from('elections').select('*').eq('estado', 'abierta').single(),
    ]);

    const totalVotantesCount = totalVotantes.count || 0;
    const totalVotosCount = totalVotos.count || 0;
    const participacion = totalVotantesCount > 0 
      ? (totalVotosCount / totalVotantesCount) * 100 
      : 0;

    return {
      total_votantes: totalVotantesCount,
      total_votos: totalVotosCount,
      participacion,
      estado_eleccion: election.data?.estado || 'cerrada',
    };
  },

  async resetElection(): Promise<void> {
    // 1. Eliminar todos los votos de la tabla
    const { error: errVotos } = await supabase
      .from('votos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (errVotos) throw errVotos;

    // 2. Restablecer el estado de todos los votantes a 'ya_voto = false'
    const { error: errVotantes } = await supabase
      .from('votantes')
      .update({ ya_voto: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (errVotantes) throw errVotantes;
  },
};
