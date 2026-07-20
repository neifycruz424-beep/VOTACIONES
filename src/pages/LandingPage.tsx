import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Vote, Shield, Users, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="max-w-3xl w-full bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative z-10">
        <CardContent className="p-12 text-center">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-6 shadow-lg animate-bounce">
              <Vote className="w-12 h-12 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de Votaciones
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-2xl text-gray-700 font-medium">
              Elecciones Internas 2026
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              Bienvenido al sistema de votaciones oficial. Su voto es seguro, confidencial y cuenta para el futuro de nuestra organización.
            </p>

            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Seguro</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Transparente</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                  <Vote className="w-6 h-6 text-pink-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Confiable</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => navigate('/votar')}
              className="w-full sm:w-auto px-12 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Votación
            </Button>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200 font-medium"
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
