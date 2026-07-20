import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { planchaService } from '../services/planchaService';
import type { Plancha } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const AdminPlanchas: React.FC = () => {
  const navigate = useNavigate();
  const [planchas, setPlanchas] = useState<Plancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlancha, setEditingPlancha] = useState<Plancha | null>(null);
  const [formData, setFormData] = useState({ nombre: '', color: '#3B82F6', logo: '' });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadPlanchas();
  }, [navigate]);

  const loadPlanchas = async () => {
    try {
      const data = await planchaService.getAllPlanchas();
      setPlanchas(data);
    } catch (err) {
      console.error('Error loading planchas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlancha) {
        await planchaService.updatePlancha(editingPlancha.id, formData);
      } else {
        await planchaService.createPlancha(formData);
      }
      setShowModal(false);
      setEditingPlancha(null);
      setFormData({ nombre: '', color: '#3B82F6', logo: '' });
      loadPlanchas();
    } catch (err) {
      console.error('Error saving plancha:', err);
    }
  };

  const handleEdit = (plancha: Plancha) => {
    setEditingPlancha(plancha);
    setFormData({ nombre: plancha.nombre, color: plancha.color, logo: plancha.logo || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta plancha?')) {
      try {
        await planchaService.deletePlancha(id);
        loadPlanchas();
      } catch (err) {
        console.error('Error deleting plancha:', err);
      }
    }
  };

  const handleAdd = () => {
    setEditingPlancha(null);
    setFormData({ nombre: '', color: '#3B82F6', logo: '' });
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Planchas</h1>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Plancha
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {planchas.map((plancha) => (
            <Card key={plancha.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: plancha.color }}
                  >
                    {plancha.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{plancha.nombre}</h3>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: plancha.color }}
                      />
                      <span className="text-sm text-gray-600">{plancha.color}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plancha)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(plancha.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPlancha(null);
          setFormData({ nombre: '', color: '#3B82F6', logo: '' });
        }}
        title={editingPlancha ? 'Editar Plancha' : 'Agregar Plancha'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la Plancha"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-16 rounded cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                required
              />
            </div>
          </div>
          <Input
            label="Logo (URL opcional)"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingPlancha(null);
                setFormData({ nombre: '', color: '#3B82F6', logo: '' });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingPlancha ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
