import { supabase } from '../lib/supabase';
import type { Candidato } from '../types';

export const candidatoService = {
  async getAllCandidatos(): Promise<Candidato[]> {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*, cargo(*), plancha(*)')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCandidatosByCargo(cargoId: string): Promise<Candidato[]> {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*, cargo(*), plancha(*)')
      .eq('cargo_id', cargoId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCandidatoById(id: string): Promise<Candidato | null> {
    const { data, error } = await supabase
      .from('candidatos')
      .select('*, cargo(*), plancha(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCandidato(candidato: Omit<Candidato, 'id' | 'created_at' | 'updated_at'>): Promise<Candidato> {
    const { data, error } = await supabase
      .from('candidatos')
      .insert(candidato)
      .select('*, cargo(*), plancha(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async updateCandidato(id: string, updates: Partial<Candidato>): Promise<Candidato> {
    const { data, error } = await supabase
      .from('candidatos')
      .update(updates)
      .eq('id', id)
      .select('*, cargo(*), plancha(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCandidato(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidatos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadPhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `candidate-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidate-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('candidate-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
};
