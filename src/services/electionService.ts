import { supabase } from '../lib/supabase';
import type { Election } from '../types';

export const electionService = {
  async getActiveElection(): Promise<Election | null> {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('estado', 'abierta')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllElections(): Promise<Election[]> {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createElection(election: Omit<Election, 'id' | 'created_at' | 'updated_at'>): Promise<Election> {
    const { data, error } = await supabase
      .from('elections')
      .insert(election)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateElection(id: string, updates: Partial<Election>): Promise<Election> {
    const { data, error } = await supabase
      .from('elections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async closeElection(id: string): Promise<Election> {
    return this.updateElection(id, { estado: 'cerrada' });
  },

  async openElection(id: string): Promise<Election> {
    return this.updateElection(id, { estado: 'abierta' });
  },
};
