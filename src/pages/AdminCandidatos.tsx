import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { candidatoService } from '../services/candidatoService';
import { cargoService } from '../services/cargoService';
import { planchaService } from '../services/planchaService';
import type { Candidato, Cargo, Plancha } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft, Upload } from 'lucide-react';

export const AdminCandidatos: React.FC = () => {
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [planchas, setPlanchas] = useState<Plancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidato, setEditingCandidato] = useState<Candidato | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cargo_id: '',
    plancha_id: '',
    foto: '' as string | null,
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [candidatosData, cargosData, planchasData] = await Promise.all([
        candidatoService.getAllCandidatos(),
        cargoService.getAllCargos(),
        planchaService.getAllPlanchas(),
      ]);
      setCandidatos(candidatosData);
      setCargos(cargosData);
      setPlanchas(planchasData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const photoUrl = await candidatoService.uploadPhoto(file);
        setFormData({ ...formData, foto: photoUrl });
      } catch (err) {
        console.error('Error uploading photo:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCandidato) {
        await candidatoService.updateCandidato(editingCandidato.id, formData);
      } else {
        await candidatoService.createCandidato(formData);
      }
      setShowModal(false);
      setEditingCandidato(null);
      setFormData({ nombre: '', cargo_id: '', plancha_id: '', foto: null });
      loadData();
    } catch (err) {
      console.error('Error saving candidato:', err);
    }
  };

  const handleEdit = (candidato: Candidato) => {
    setEditingCandidato(candidato);
    setFormData({
      nombre: candidato.nombre,
      cargo_id: candidato.cargo_id,
      plancha_id: candidato.plancha_id,
      foto: candidato.foto,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este candidato?')) {
      try {
        await candidatoService.deleteCandidato(id);
        loadData();
      } catch (err) {
        console.error('Error deleting candidato:', err);
      }
    }
  };

  const handleAdd = () => {
    setEditingCandidato(null);
    setFormData({ nombre: '', cargo_id: '', plancha_id: '', foto: null });
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
              <h1 className="text-xl font-bold text-gray-900">Gestión de Candidatos</h1>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Candidato
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidatos.map((candidato) => (
            <Card key={candidato.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {candidato.foto ? (
                    <img
                      src={candidato.foto}
                      alt={candidato.nombre}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl">{candidato.nombre.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidato.nombre}</h3>
                    <p className="text-sm text-gray-600">{candidato.cargo?.nombre}</p>
                    <div
                      className="inline-block px-2 py-1 rounded text-xs text-white mt-1"
                      style={{ backgroundColor: candidato.plancha?.color }}
                    >
                      {candidato.plancha?.nombre}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(candidato)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(candidato.id)}>
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
          setEditingCandidato(null);
          setFormData({ nombre: '', cargo_id: '', plancha_id: '', foto: null });
        }}
        title={editingCandidato ? 'Editar Candidato' : 'Agregar Candidato'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
            <div className="flex items-center space-x-4">
              {formData.foto && (
                <img src={formData.foto} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
              )}
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Foto
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>

          <Input
            label="Nombre del Candidato"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select
              value={formData.cargo_id}
              onChange={(e) => setFormData({ ...formData, cargo_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plancha</label>
            <select
              value={formData.plancha_id}
              onChange={(e) => setFormData({ ...formData, plancha_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar plancha</option>
              {planchas.map((plancha) => (
                <option key={plancha.id} value={plancha.id}>
                  {plancha.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingCandidato(null);
                setFormData({ nombre: '', cargo_id: '', plancha_id: '', foto: null });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingCandidato ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
