import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votanteService } from '../services/votanteService';
import type { Votante } from '../types';
import { Plus, Pencil, Trash2, ArrowLeft, CheckCircle, Clock, Users, Printer } from 'lucide-react';

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
      {/* Contenido en pantalla (oculto al imprimir) */}
      <div className="print:hidden">
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
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => window.print()} className="border-gray-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Votante
                </Button>
              </div>
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

      {/* Reporte de Votantes para Impresión PDF (visible solo en impresión) */}
      <div className="hidden print:block bg-white text-black p-8 min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="/company_logo.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Padrón Electoral de Votantes</h1>
              <p className="text-sm text-gray-500 font-medium">Elecciones Internas 2026</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Fecha de emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Resumen de estadísticas en el PDF */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">Total Electores</span>
            <p className="text-xl font-bold mt-1 text-gray-900">{votantes.length}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">Ya Votaron</span>
            <p className="text-xl font-bold mt-1 text-green-600">{votantes.filter(v => v.ya_voto).length}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase">Pendientes</span>
            <p className="text-xl font-bold mt-1 text-orange-600">{votantes.filter(v => !v.ya_voto).length}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-200 text-left text-sm mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-2 font-bold text-gray-700">Nombre del Elector</th>
              <th className="border border-gray-200 px-4 py-2 font-bold text-gray-700">Identificación (Cédula)</th>
              <th className="border border-gray-200 px-4 py-2 font-bold text-gray-700">Estado de Voto</th>
            </tr>
          </thead>
          <tbody>
            {votantes.map((votante) => (
              <tr key={votante.id} className="hover:bg-gray-50/50">
                <td className="border border-gray-200 px-4 py-2 font-semibold text-gray-800">{votante.nombre}</td>
                <td className="border border-gray-200 px-4 py-2 text-gray-600 font-mono">{votante.codigo}</td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className={`font-bold ${votante.ya_voto ? 'text-green-600' : 'text-orange-500'}`}>
                    {votante.ya_voto ? 'VOTÓ' : 'PENDIENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
