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
import { Plus, Pencil, Trash2, ArrowLeft, Upload, Printer } from 'lucide-react';

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
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      setIsUploading(true);
      setFormError('');
      try {
        const photoUrl = await candidatoService.uploadPhoto(file);
        setFormData({ ...formData, foto: photoUrl });
      } catch (err: any) {
        console.error('Error uploading photo:', err);
        setFormError(
          'No se pudo subir la foto. Esto ocurre porque el almacenamiento (bucket) "candidate-photos" no está creado o configurado en tu Supabase. Como alternativa, puedes ingresar el enlace/URL de la imagen de Google abajo.'
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingCandidato) {
        await candidatoService.updateCandidato(editingCandidato.id, {
          nombre: formData.nombre,
          cargo_id: formData.cargo_id,
          plancha_id: formData.plancha_id,
          foto: formData.foto,
        });
      } else {
        await candidatoService.createCandidato({
          nombre: formData.nombre,
          cargo_id: formData.cargo_id,
          plancha_id: formData.plancha_id,
          foto: formData.foto,
        });
      }
      setShowModal(false);
      setEditingCandidato(null);
      setFormData({ nombre: '', cargo_id: '', plancha_id: '', foto: null });
      loadData();
    } catch (err: any) {
      console.error('Error saving candidato:', err);
      if (err.message && err.message.includes('unique')) {
        setFormError('Ya existe un candidato registrado para este cargo en esta plancha.');
      } else {
        setFormError(err.message || 'Error al guardar el candidato. Intente nuevamente.');
      }
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
                <h1 className="text-xl font-bold text-gray-900">Gestión de Candidatos</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => window.print()} className="border-gray-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Candidato
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
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
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Foto del Candidato</label>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {formData.foto ? (
                <img src={formData.foto} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-300 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 shadow-sm">
                  <span className="text-gray-400 text-xs">Sin Foto</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className={`cursor-pointer self-start ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  <span className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                  </span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isUploading} />
                </label>
                {formData.foto && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, foto: null })}
                    className="text-xs text-red-600 hover:text-red-800 text-left font-medium"
                  >
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>
            
            <Input
              label="O enlace/URL de la imagen (ej: de Google o Unsplash)"
              placeholder="https://ejemplo.com/foto.jpg"
              value={formData.foto || ''}
              onChange={(e) => setFormData({ ...formData, foto: e.target.value || null })}
              className="text-sm"
            />
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

      {/* Planilla de Candidatos para Impresión PDF (visible solo en impresión) */}
      <div className="hidden print:block bg-white text-black p-8 min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="/company_logo.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Planilla de Candidatos</h1>
              <p className="text-sm text-gray-500 font-medium">Elecciones Internas 2026</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Fecha de emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* COLUMNA PLANCHA 1 */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/20">
            <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-200 pb-2 mb-4 uppercase tracking-wider text-center">
              Plancha 1
            </h2>
            <div className="space-y-5">
              {cargos.map((cargo) => {
                const cargoCandidatos = candidatos.filter(
                  c => c.plancha?.nombre.toLowerCase().includes('1') && c.cargo_id === cargo.id
                );
                if (cargoCandidatos.length === 0) return null;
                return (
                  <div key={cargo.id} className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block border-b border-gray-100 pb-0.5">
                      {cargo.nombre}
                    </span>
                    <div className="space-y-1.5">
                      {cargoCandidatos.map((cand) => (
                        <div key={cand.id} className="flex items-center gap-3 p-2 bg-white border border-gray-150 rounded-lg shadow-sm">
                          {cand.foto ? (
                            <img src={cand.foto} alt={cand.nombre} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                              {cand.nombre.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-gray-800 text-sm">{cand.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA PLANCHA 2 */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/20">
            <h2 className="text-xl font-bold text-red-600 border-b-2 border-red-200 pb-2 mb-4 uppercase tracking-wider text-center">
              Plancha 2
            </h2>
            <div className="space-y-5">
              {cargos.map((cargo) => {
                const cargoCandidatos = candidatos.filter(
                  c => c.plancha?.nombre.toLowerCase().includes('2') && c.cargo_id === cargo.id
                );
                if (cargoCandidatos.length === 0) return null;
                return (
                  <div key={cargo.id} className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 block border-b border-gray-100 pb-0.5">
                      {cargo.nombre}
                    </span>
                    <div className="space-y-1.5">
                      {cargoCandidatos.map((cand) => (
                        <div key={cand.id} className="flex items-center gap-3 p-2 bg-white border border-gray-150 rounded-lg shadow-sm">
                          {cand.foto ? (
                            <img src={cand.foto} alt={cand.nombre} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                              {cand.nombre.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-gray-800 text-sm">{cand.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
