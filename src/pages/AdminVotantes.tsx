import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votanteService } from '../services/votanteService';
import type { Votante } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle, Clock, Users } from 'lucide-react';

export const AdminVotantes: React.FC = () => {
  const navigate = useNavigate();
  const [votantes, setVotantes] = useState<Votante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVotante, setEditingVotante] = useState<Votante | null>(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '' });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadVotantes();
  }, [navigate]);

  const loadVotantes = async () => {
    try {
      const data = await votanteService.getAllVotantes();
      setVotantes(data);
    } catch (err) {
      console.error('Error loading votantes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVotante) {
        await votanteService.updateVotante(editingVotante.id, formData);
      } else {
        await votanteService.createVotante({ ...formData, ya_voto: false });
      }
      setShowModal(false);
      setEditingVotante(null);
      setFormData({ codigo: '', nombre: '' });
      loadVotantes();
    } catch (err) {
      console.error('Error saving votante:', err);
    }
  };

  const handleEdit = (votante: Votante) => {
    setEditingVotante(votante);
    setFormData({ codigo: votante.codigo, nombre: votante.nombre });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este votante?')) {
      try {
        await votanteService.deleteVotante(id);
        loadVotantes();
      } catch (err) {
        console.error('Error deleting votante:', err);
      }
    }
  };

  const handleAdd = () => {
    setEditingVotante(null);
    setFormData({ codigo: '', nombre: '' });
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
              <h1 className="text-xl font-bold text-gray-900">Gestión de Votantes</h1>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Votante
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{votantes.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Votaron</p>
                  <p className="text-2xl font-bold text-green-600">
                    {votantes.filter(v => v.ya_voto).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {votantes.filter(v => !v.ya_voto).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {votantes.map((votante) => (
            <Card key={votante.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{votante.nombre}</h3>
                    <p className="text-sm text-gray-600">{votante.codigo}</p>
                  </div>
                  {votante.ya_voto ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(votante)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(votante.id)}>
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
          setEditingVotante(null);
          setFormData({ codigo: '', nombre: '' });
        }}
        title={editingVotante ? 'Editar Votante' : 'Agregar Votante'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            required
          />
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingVotante(null);
                setFormData({ codigo: '', nombre: '' });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingVotante ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
