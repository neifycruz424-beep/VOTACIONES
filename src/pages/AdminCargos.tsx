import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { cargoService } from '../services/cargoService';
import type { Cargo } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';

export const AdminCargos: React.FC = () => {
  const navigate = useNavigate();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState({ nombre: '', orden: 0 });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadCargos();
  }, [navigate]);

  const loadCargos = async () => {
    try {
      const data = await cargoService.getAllCargos();
      setCargos(data);
    } catch (err) {
      console.error('Error loading cargos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCargo) {
        await cargoService.updateCargo(editingCargo.id, formData);
      } else {
        await cargoService.createCargo(formData);
      }
      setShowModal(false);
      setEditingCargo(null);
      setFormData({ nombre: '', orden: 0 });
      loadCargos();
    } catch (err) {
      console.error('Error saving cargo:', err);
    }
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({ nombre: cargo.nombre, orden: cargo.orden });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await cargoService.deleteCargo(id);
        loadCargos();
      } catch (err) {
        console.error('Error deleting cargo:', err);
      }
    }
  };

  const handleAdd = () => {
    setEditingCargo(null);
    setFormData({ nombre: '', orden: cargos.length + 1 });
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
              <h1 className="text-xl font-bold text-gray-900">Gestión de Cargos</h1>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Cargo
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cargos.map((cargo) => (
            <Card key={cargo.id}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{cargo.nombre}</h3>
                <p className="text-sm text-gray-600">Orden: {cargo.orden}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(cargo)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(cargo.id)}>
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
          setEditingCargo(null);
          setFormData({ nombre: '', orden: 0 });
        }}
        title={editingCargo ? 'Editar Cargo' : 'Agregar Cargo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del Cargo"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Orden"
            type="number"
            value={formData.orden}
            onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingCargo(null);
                setFormData({ nombre: '', orden: 0 });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingCargo ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
