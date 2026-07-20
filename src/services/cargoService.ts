import { supabase } from '../lib/supabase';
import type { Cargo } from '../types';

export const cargoService = {
  async getAllCargos(): Promise<Cargo[]> {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCargoById(id: string): Promise<Cargo | null> {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createCargo(cargo: Omit<Cargo, 'id' | 'created_at' | 'updated_at'>): Promise<Cargo> {
    const { data, error } = await supabase
      .from('cargos')
      .insert(cargo)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCargo(id: string, updates: Partial<Cargo>): Promise<Cargo> {
    const { data, error } = await supabase
      .from('cargos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCargo(id: string): Promise<void> {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateCargoOrder(cargos: { id: string; orden: number }[]): Promise<void> {
    const updates = cargos.map(cargo =>
      supabase.from('cargos').update({ orden: cargo.orden }).eq('id', cargo.id)
    );

    await Promise.all(updates);
  },
};
