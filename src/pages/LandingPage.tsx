import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Vote, Shield, Users, Sparkles, Building2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="max-w-2xl w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 text-white rounded-2xl overflow-hidden">
        {/* Top institutional color bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500"></div>

        <CardContent className="p-10 md:p-14 text-center">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-xl shadow-blue-500/15 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Vote className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold tracking-widest text-blue-400 uppercase">
                Sistema Electoral Central
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
              Elecciones Internas
            </h1>
            
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 font-medium shadow-inner">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Período Electoral Activo
            </div>
          </div>

          <div className="space-y-6 mb-10 max-w-lg mx-auto">
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Bienvenido a la plataforma de votación electrónica. Su participación en este proceso es segura, personal y totalmente confidencial.
            </p>

            <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5 my-8 bg-slate-950/20 rounded-xl px-4">
              <div className="flex flex-col items-center p-2">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-white">Voto Seguro</p>
                <p className="text-xs text-slate-500 mt-1 text-center hidden md:block">Encriptación de extremo a extremo</p>
              </div>
              <div className="flex flex-col items-center p-2">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-white">Transparente</p>
                <p className="text-xs text-slate-500 mt-1 text-center hidden md:block">Resultados auditados</p>
              </div>
              <div className="flex flex-col items-center p-2">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Vote className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-white">100% Secreto</p>
                <p className="text-xs text-slate-500 mt-1 text-center hidden md:block">Privacidad garantizada</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Button
              size="lg"
              onClick={() => navigate('/votar')}
              className="w-full sm:w-auto px-16 py-4.5 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 transform hover:scale-[1.03] transition-all duration-300 rounded-xl"
            >
              Iniciar Votación
            </Button>

            <div className="pt-8 border-t border-white/5 flex justify-center">
              <button
                onClick={() => navigate('/admin')}
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors duration-200 uppercase tracking-widest font-semibold"
              >
                Panel de Administración
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
