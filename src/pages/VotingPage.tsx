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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            ← Volver
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-3xl font-bold text-gray-900">
              Votación - {votante?.nombre}
            </h1>
            <p className="text-gray-600">
              Seleccione un candidato para cada cargo
            </p>
          </CardHeader>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {cargos.map((cargo) => {
            const cargoCandidatos = candidatos.filter(c => c.cargo_id === cargo.id);
            const selectedCandidateId = selections[cargo.id];

            return (
              <Card key={cargo.id}>
                <CardHeader>
                  <h2 className="text-2xl font-semibold text-gray-900">{cargo.nombre}</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cargoCandidatos.map((candidato) => (
                      <div
                        key={candidato.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedCandidateId === candidato.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectCandidate(cargo.id, candidato.id)}
                      >
                        <div className="flex items-center space-x-4">
                          {candidato.foto ? (
                            <img
                              src={candidato.foto}
                              alt={candidato.nombre}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-2xl">
                                {candidato.nombre.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {candidato.nombre}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {candidato.plancha?.nombre}
                            </p>
                            <div
                              className="inline-block px-2 py-1 rounded text-xs text-white mt-2"
                              style={{ backgroundColor: candidato.plancha?.color }}
                            >
                              {candidato.plancha?.nombre}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedCandidateId === candidato.id
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedCandidateId === candidato.id && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
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
            <p className="text-gray-700">
              ¿Está seguro de enviar su voto? Una vez enviado no podrá modificarlo.
            </p>

            <div className="space-y-2">
              {cargos.map((cargo) => {
                const selectedCandidateId = selections[cargo.id];
                const candidate = candidatos.find(c => c.id === selectedCandidateId);

                return (
                  <div key={cargo.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{cargo.nombre}:</span>
                    <span className="text-gray-700">{candidate?.nombre}</span>
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
