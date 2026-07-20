import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Vote } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
              <Vote className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sistema de Votaciones
            </h1>
            <p className="text-xl text-gray-600">
              Elecciones Internas 2024
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 text-lg">
              Bienvenido al sistema de votaciones oficial. Por favor, identifíquese con su código de votante para participar en el proceso electoral.
            </p>

            <div className="pt-6">
              <Button
                size="lg"
                onClick={() => navigate('/votar')}
                className="w-full sm:w-auto px-8"
              >
                Iniciar Votación
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Acceso Administrativo
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
