import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { cargoService } from '../services/cargoService';
import { candidatoService } from '../services/candidatoService';
import { votoService } from '../services/votoService';
import type { Cargo, Candidato, Votante, VoteSelection } from '../types';
import { ArrowLeft, CheckCircle2, User, Award, ShieldAlert } from 'lucide-react';

export const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const votante = location.state?.votante as Votante;

  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
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
      const [cargosData, candidatosData] = await Promise.all([
        cargoService.getAllCargos(),
        candidatoService.getAllCandidatos(),
      ]);

      // Sort cargos by order
      const sortedCargos = cargosData.sort((a, b) => a.orden - b.orden);
      setCargos(sortedCargos);
      setCandidatos(candidatosData);
    } catch (err) {
      setError('Error al cargar los datos de la votación. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCandidate = (cargoId: string, candidatoId: string) => {
    setSelections(prev => ({
      ...prev,
      [cargoId]: candidatoId,
    }));
  };

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const voteSelections: VoteSelection[] = Object.entries(selections).map(
        ([cargoId, candidatoId]) => ({
          cargo_id: cargoId,
          candidato_id: candidatoId as string,
        })
      );

      await votoService.submitVote(votante.id, voteSelections);
      navigate('/votar/exito');
    } catch (err) {
      setError('Error al enviar el voto. Por favor intente nuevamente.');
      console.error(err);
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // We are complete if all loaded positions have a selection
  const isComplete = cargos.length > 0 && Object.keys(selections).length === cargos.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 py-8 px-4 relative overflow-hidden text-white">
      {/* Decorative background blur elements */}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Papeleta Digital de Votación
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Marque un candidato para cada uno de los cargos indicados abajo
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
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

        {/* Display categories as blocks in a responsive grid. In desktop they appear side-by-side as two blocks/columns. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cargos.map((cargo, index) => {
            const cargoCandidatos = candidatos.filter(c => c.cargo_id === cargo.id);
            const selectedCandidateId = selections[cargo.id];

            return (
              <Card key={cargo.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 bg-slate-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {cargo.nombre}
                    </h2>
                  </div>
                  {selectedCandidateId ? (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionado
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-semibold">
                      Pendiente
                    </span>
                  )}
                </div>

                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                  {cargoCandidatos.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-xl">
                      No hay candidatos registrados para este puesto
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {cargoCandidatos.map((candidato) => {
                        const isSelected = selectedCandidateId === candidato.id;
                        return (
                          <div
                            key={candidato.id}
                            className={`border-2 rounded-xl p-4.5 cursor-pointer transition-all duration-300 transform active:scale-[0.99] ${
                              isSelected
                                ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-lg shadow-blue-500/5'
                                : 'border-white/5 hover:border-white/15 bg-slate-950/30'
                            }`}
                            onClick={() => handleSelectCandidate(cargo.id, candidato.id)}
                          >
                            <div className="flex items-center gap-4">
                              {/* CANDIDATE PHOTO ON THE LEFT SIDE OF THE CARD */}
                              {candidato.foto ? (
                                <img
                                  src={candidato.foto}
                                  alt={candidato.nombre}
                                  className="w-16 h-16 rounded-full object-cover border border-white/10 shadow-md"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-md">
                                  <User className="text-slate-400 w-7 h-7" />
                                </div>
                              )}
                              
                              {/* DETAILS ON THE RIGHT SIDE */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white text-base truncate">
                                  {candidato.nombre}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 mb-2 truncate">
                                  {candidato.plancha?.nombre || 'Plancha Independiente'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/10"
                                    style={{ backgroundColor: candidato.plancha?.color || '#cbd5e1' }}
                                  ></span>
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                    {candidato.plancha?.nombre || 'Independiente'}
                                  </span>
                                </div>
                              </div>

                              {/* SELECTOR INDICATOR */}
                              <div className="flex items-center justify-center pl-2">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-500 text-white'
                                      : 'border-white/20 hover:border-white/40'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center md:justify-end">
          <Button
            size="lg"
            onClick={() => setShowConfirmModal(true)}
            disabled={!isComplete || isSubmitting}
            className="px-16 py-4.5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl w-full sm:w-auto"
          >
            {isSubmitting ? 'Procesando...' : 'Revisar Papeleta'}
          </Button>
        </div>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmación de Sufragio"
          size="lg"
        >
          <div className="space-y-6 text-white">
            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/25 p-4 rounded-xl text-slate-300 text-sm">
              <Award className="w-6 h-6 text-blue-400 shrink-0" />
              <p>
                Por favor, verifique sus selecciones. Al pulsar <strong>Confirmar y Enviar</strong>, su voto se guardará de forma irreversible y anónima en el sistema.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/40 p-5 border border-white/5 rounded-xl">
              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Resumen de Papeleta</h3>
              {cargos.map((cargo) => {
                const selectedCandidateId = selections[cargo.id];
                const candidate = candidatos.find(c => c.id === selectedCandidateId);

                return (
                  <div key={cargo.id} className="flex justify-between items-center p-3.5 bg-slate-900/60 border border-white/5 rounded-lg">
                    <span className="font-semibold text-slate-400 text-sm">{cargo.nombre}:</span>
                    <span className="text-blue-400 font-bold text-sm">{candidate?.nombre}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/5">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 py-3"
              >
                Volver a Modificar
              </Button>
              <Button
                onClick={handleSubmitVote}
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 shadow-lg shadow-blue-500/10"
              >
                Confirmar y Enviar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
