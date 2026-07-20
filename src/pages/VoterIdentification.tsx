import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { votanteService } from '../services/votanteService';
import { User, ArrowLeft, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="max-w-md w-full bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative z-10">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Identificación
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Ingrese su código de votante para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Código de Votante"
                placeholder="Ingrese su código único"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                error={error}
                disabled={isLoading}
                autoFocus
                className="text-lg"
              />
              <div className="absolute right-3 top-9">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              isLoading={isLoading}
              disabled={!codigo.trim()}
            >
              Validar Código
            </Button>

            <p className="text-center text-sm text-gray-500">
              Su información está protegida y es confidencial
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
