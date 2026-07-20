import { supabase } from '../lib/supabase';
import type { Votante } from '../types';

export const votanteService = {
  async getAllVotantes(): Promise<Votante[]> {
    const { data, error } = await supabase
      .from('votantes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getVotanteByCode(codigo: string): Promise<Votante | null> {
    const { data, error } = await supabase
      .from('votantes')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getVotanteById(id: string): Promise<Votante | null> {
    const { data, error } = await supabase
      .from('votantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createVotante(votante: Omit<Votante, 'id' | 'created_at' | 'updated_at'>): Promise<Votante> {
    const { data, error } = await supabase
      .from('votantes')
      .insert(votante)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVotante(id: string, updates: Partial<Votante>): Promise<Votante> {
    const { data, error } = await supabase
      .from('votantes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVotante(id: string): Promise<void> {
    const { error } = await supabase
      .from('votantes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markAsVoted(id: string): Promise<Votante> {
    return this.updateVotante(id, { ya_voto: true });
  },

  async getVotingStats(): Promise<{ total: number; voted: number; pending: number }> {
    const { data, error } = await supabase
      .from('votantes')
      .select('ya_voto');

    if (error) throw error;

    const total = data?.length || 0;
    const voted = data?.filter(v => v.ya_voto).length || 0;
    const pending = total - voted;

    return { total, voted, pending };
  },
};
