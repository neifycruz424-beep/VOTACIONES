import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { cargoService } from '../services/cargoService';
import { candidatoService } from '../services/candidatoService';
import { planchaService } from '../services/planchaService';
import { votoService } from '../services/votoService';
import type { Cargo, Candidato, Plancha, Votante, VoteSelection } from '../types';
import { ArrowLeft, User, Award, ShieldAlert, Check } from 'lucide-react';

export const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const votante = location.state?.votante as Votante;

  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [planchas, setPlanchas] = useState<Plancha[]>([]);
  const [selectedPlanchaId, setSelectedPlanchaId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!votante) {
      navigate('/votar');
      return;
    }

    loadData();
  }, [votante, navigate]);

  const loadData = async () => {
    try {
      const [cargosData, candidatosData, planchasData] = await Promise.all([
        cargoService.getAllCargos(),
        candidatoService.getAllCandidatos(),
        planchaService.getAllPlanchas(),
      ]);

      setCargos(cargosData.sort((a, b) => a.orden - b.orden));
      setCandidatos(candidatosData);
      setPlanchas(planchasData);
    } catch (err) {
      setError('Error al cargar los datos de la votación. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedPlanchaId) return;
    setIsSubmitting(true);
    setError('');

    try {
      // Get all candidates of the selected plancha
      const planchaCandidatos = candidatos.filter(c => c.plancha_id === selectedPlanchaId);

      // Create vote selections for each candidate's cargo
      const voteSelections: VoteSelection[] = planchaCandidatos.map(c => ({
        cargo_id: c.cargo_id,
        candidato_id: c.id,
      }));

      const sospechoso = location.state?.sospechoso || false;
      const motivoSospecha = location.state?.motivoSospecha || null;

      await votoService.submitVote(votante.id, voteSelections, sospechoso, motivoSospecha);
      navigate('/votar/exito');
    } catch (err) {
      setError('Error al enviar el voto. Por favor intente nuevamente.');
      console.error(err);
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Find the selected plancha object
  const selectedPlancha = planchas.find(p => p.id === selectedPlanchaId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 relative overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[130px] animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir
          </Button>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-full px-4 py-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Elector: <span className="text-white font-semibold">{votante?.nombre}</span>
          </div>
        </div>

        <Card className="mb-8 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
          <CardHeader className="pb-6 pt-8 px-8 border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/company_logo.png" 
                  alt="Invernandez Logo" 
                  className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Papeleta de Votación por Planchas
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Seleccione la plancha de su preferencia para elegir el gabinete completo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-start md:self-center px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
                ID Elector: {votante?.codigo}
              </div>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            {error}
          </div>
        )}

        {/* Display Planchas side-by-side as two blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {planchas.map((plancha) => {
            const isSelected = selectedPlanchaId === plancha.id;
            const planchaCandidatos = candidatos.filter(c => c.plancha_id === plancha.id);
            const isPlancha1 = plancha.nombre.toLowerCase().includes('1');

            return (
              <div
                key={plancha.id}
                className={`relative rounded-3xl p-6 transition-all duration-300 border-2 flex flex-col min-h-[500px] cursor-pointer ${
                  isSelected
                    ? isPlancha1
                      ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/5'
                      : 'border-red-500 bg-red-500/5 shadow-2xl shadow-red-500/5'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                }`}
                onClick={() => setSelectedPlanchaId(plancha.id)}
              >
                {/* Plancha Selection Header */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-4 h-4 rounded-full border border-white/20 inline-block shrink-0"
                      style={{ backgroundColor: plancha.color }}
                    ></span>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                        {plancha.nombre}
                      </h2>
                      {plancha.eslogan && (
                        <p className="text-xs text-slate-400 italic font-medium mt-0.5">
                          "{plancha.eslogan}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? isPlancha1
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                        : 'border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-5 h-5" />}
                  </div>
                </div>

                {/* Candidates Slate list (displays multiple candidates per cargo, e.g. 4 Vocales) */}
                <div className="space-y-5 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Integrantes del Gabinete</p>
                  {cargos.map((cargo) => {
                    const cargoCandidatos = planchaCandidatos.filter(c => c.cargo_id === cargo.id);
                    if (cargoCandidatos.length === 0) return null;

                    return (
                      <div key={cargo.id} className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500/80 block">
                          {cargo.nombre}
                        </span>
                        <div className="space-y-1.5">
                          {cargoCandidatos.map((candidato) => (
                            <div key={candidato.id} className="flex items-center gap-3 p-2.5 bg-slate-950/20 rounded-xl border border-white/5">
                              {candidato.foto ? (
                                <img
                                  src={candidato.foto}
                                  alt={candidato.nombre}
                                  className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                  <User className="text-slate-400 w-4 h-4" />
                                </div>
                              )}
                              <span className="font-bold text-white text-sm truncate">
                                {candidato.nombre}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Big Button overlaying selections */}
                <button
                  type="button"
                  className={`w-full py-4 mt-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? isPlancha1
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanchaId(plancha.id);
                  }}
                >
                  {isSelected ? 'Plancha Seleccionada' : 'Seleccionar Plancha'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedPlanchaId || isSubmitting}
            className="px-20 py-5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-2xl shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all rounded-xl w-full sm:w-auto"
          >
            {isSubmitting ? 'Procesando...' : 'Revisar e Inscribir Voto'}
          </Button>
        </div>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmación de Voto por Plancha"
          size="md"
        >
          <div className="space-y-6 text-gray-800 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-200 p-4 rounded-xl text-gray-700 text-sm">
              <Award className="w-6 h-6 text-blue-600 shrink-0" />
              <p>
                Al confirmar, registrarás tu voto para la <strong>{selectedPlancha?.nombre}</strong>. Todos sus candidatos serán votados para sus respectivos puestos.
              </p>
            </div>

            <div className="bg-gray-50 p-5 border border-gray-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm font-bold text-gray-500">Plancha Elegida:</span>
                <span className="text-lg font-black uppercase text-gray-950" style={{ color: selectedPlancha?.color }}>
                  {selectedPlancha?.nombre}
                </span>
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Gabinete Propuesto:</p>
                {cargos.map((cargo) => {
                  const cargoCandidatos = candidatos.filter(
                    c => c.plancha_id === selectedPlanchaId && c.cargo_id === cargo.id
                  );
                  if (cargoCandidatos.length === 0) return null;
                  return (
                    <div key={cargo.id} className="flex justify-between items-start text-xs py-1.5 border-b border-gray-150 last:border-0">
                      <span className="text-gray-500 font-semibold">{cargo.nombre}:</span>
                      <div className="text-right max-w-[65%]">
                        {cargoCandidatos.map(c => (
                          <div key={c.id} className="text-gray-900 font-bold truncate">{c.nombre}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-150">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3"
              >
                Modificar
              </Button>
              <Button
                onClick={handleSubmitVote}
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 shadow-lg shadow-blue-500/10"
              >
                Confirmar y Guardar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
