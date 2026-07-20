import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { votanteService } from '../services/votanteService';

export const VoterIdentification: React.FC = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const voter = await votanteService.getVotanteByCode(codigo);
      
      if (!voter) {
        setError('Código de votante no encontrado');
        return;
      }

      if (voter.ya_voto) {
        setError('Usted ya ejerció su derecho al voto');
        return;
      }

      navigate('/votar/candidatos', { state: { votante: voter } });
    } catch (err) {
      setError('Error al validar el código. Por favor intente nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Identificación del Votante
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Código de Votante"
              placeholder="Ingrese su código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              error={error}
              disabled={isLoading}
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={!codigo.trim()}
            >
              Continuar
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Volver
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
