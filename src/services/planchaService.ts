import { supabase } from '../lib/supabase';
import type { Plancha } from '../types';

export const planchaService = {
  async getAllPlanchas(): Promise<Plancha[]> {
    const { data, error } = await supabase
      .from('planchas')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getPlanchaById(id: string): Promise<Plancha | null> {
    const { data, error } = await supabase
      .from('planchas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPlancha(plancha: Omit<Plancha, 'id' | 'created_at' | 'updated_at'>): Promise<Plancha> {
    const { data, error } = await supabase
      .from('planchas')
      .insert(plancha)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlancha(id: string, updates: Partial<Plancha>): Promise<Plancha> {
    const { data, error } = await supabase
      .from('planchas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlancha(id: string): Promise<void> {
    const { error } = await supabase
      .from('planchas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
