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
import { ArrowLeft, CheckCircle, User } from 'lucide-react';

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

      setCargos(cargosData);
      setCandidatos(candidatosData);
    } catch (err) {
      setError('Error al cargar los datos. Por favor intente nuevamente.');
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
    }
  };

  const isComplete = cargos.length > 0 && Object.keys(selections).length === cargos.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card className="mb-8 bg-white/95 backdrop-blur-xl shadow-2xl border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Papeleta de Votación
                </h1>
                <p className="text-gray-600 text-lg">
                  Bienvenido, <span className="font-semibold">{votante?.nombre}</span>
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              Seleccione un candidato para cada cargo disponible
            </p>
          </CardHeader>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {cargos.map((cargo, index) => {
            const cargoCandidatos = candidatos.filter(c => c.cargo_id === cargo.id);
            const selectedCandidateId = selections[cargo.id];

            return (
              <Card key={cargo.id} className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {cargo.nombre}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedCandidateId ? '✓ Candidato seleccionado' : 'Seleccione un candidato'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cargoCandidatos.map((candidato) => (
                      <div
                        key={candidato.id}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedCandidateId === candidato.id
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-indigo-300 bg-white'
                        }`}
                        onClick={() => handleSelectCandidate(cargo.id, candidato.id)}
                      >
                        <div className="flex items-center space-x-4">
                          {candidato.foto ? (
                            <img
                              src={candidato.foto}
                              alt={candidato.nombre}
                              className="w-20 h-20 rounded-full object-cover shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-md">
                              <span className="text-indigo-600 text-2xl font-bold">
                                {candidato.nombre.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {candidato.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {candidato.plancha?.nombre}
                            </p>
                            <div
                              className="inline-block px-3 py-1 rounded-full text-xs text-white font-medium shadow-sm"
                              style={{ backgroundColor: candidato.plancha?.color }}
                            >
                              {candidato.plancha?.nombre}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md ${
                                selectedCandidateId === candidato.id
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedCandidateId === candidato.id && (
                                <CheckCircle className="w-5 h-5 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            onClick={() => setShowConfirmModal(true)}
            disabled={!isComplete || isSubmitting}
            className="px-12 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? 'Enviando...' : 'Revisar Voto'}
          </Button>
        </div>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmar Voto"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-700 text-lg">
              ¿Está seguro de enviar su voto? Una vez enviado no podrá modificarlo.
            </p>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              {cargos.map((cargo) => {
                const selectedCandidateId = selections[cargo.id];
                const candidate = candidatos.find(c => c.id === selectedCandidateId);

                return (
                  <div key={cargo.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    <span className="font-semibold text-gray-900">{cargo.nombre}:</span>
                    <span className="text-indigo-600 font-medium">{candidate?.nombre}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitVote}
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
