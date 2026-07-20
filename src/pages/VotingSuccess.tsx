import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircle } from 'lucide-react';

export const VotingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Voto Registrado!
            </h1>
            <p className="text-lg text-gray-600">
              Gracias por participar en el proceso electoral.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              Su voto ha sido registrado correctamente y ya no puede ser modificado.
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
