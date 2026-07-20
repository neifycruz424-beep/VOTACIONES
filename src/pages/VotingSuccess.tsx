import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircle2, Sparkles, Home, ShieldCheck } from 'lucide-react';

export const VotingSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Decorative background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Card className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 text-white rounded-2xl overflow-hidden">
        {/* Glowing top success border line */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

        <CardContent className="p-10 text-center">
          <div className="mb-8 flex flex-col items-center">
            <img 
              src="/company_logo.png" 
              alt="Logo" 
              className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-md mb-6"
            />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h1 className="text-3xl font-black bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent">
                ¡Voto Transmitido!
              </h1>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            
            <p className="text-slate-400 text-sm">
              Su participación en el proceso electoral ha concluido con éxito
            </p>
          </div>

          <div className="space-y-6 mb-8 bg-slate-950/20 p-5 rounded-xl border border-white/5">
            <p className="text-slate-300 text-sm leading-relaxed">
              Su boleta ha sido procesada de manera anónima y encriptada en la base de datos central. El sistema ha cerrado su sesión de elector para evitar duplicaciones.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              Sufragio Auditado & Asegurado
            </div>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="w-full py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
