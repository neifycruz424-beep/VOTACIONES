import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircle, Sparkles, Home } from 'lucide-react';

export const VotingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="max-w-md w-full bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative z-10">
        <CardContent className="p-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ¡Voto Registrado!
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-xl text-gray-700 font-medium">
              Gracias por participar en el proceso electoral
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Su voto ha sido registrado correctamente y ya no puede ser modificado. Su participación es fundamental para el futuro de nuestra organización.
            </p>

            <div className="pt-6">
              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="w-full px-12 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Home className="w-5 h-5 mr-2" />
                Volver al Inicio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
