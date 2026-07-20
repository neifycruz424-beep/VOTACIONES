import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { votanteService } from '../services/votanteService';
import { User, ArrowLeft, Shield, Fingerprint, Sparkles } from 'lucide-react';

export const VoterIdentification: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanNombre = nombre.trim();
    const cleanCedula = cedula.trim().replace(/[^0-9a-zA-Z]/g, ''); // Remove spaces, dashes, etc.

    if (!cleanNombre) {
      setError('Por favor ingrese su nombre completo');
      return;
    }

    if (!cleanCedula) {
      setError('Por favor ingrese su número de identificación (Cédula)');
      return;
    }

    setIsLoading(true);

    try {
      // Find the voter by ID (codigo)
      let voter = await votanteService.getVotanteByCode(cleanCedula);
      
      if (voter) {
        if (voter.ya_voto) {
          setError('El votante con esta identificación ya ejerció su derecho al voto');
          setIsLoading(false);
          return;
        }
      } else {
        // Auto-register the voter dynamically if they don't exist
        voter = await votanteService.createVotante({
          nombre: cleanNombre,
          codigo: cleanCedula,
          ya_voto: false
        });
      }

      navigate('/votar/candidatos', { state: { votante: voter } });
    } catch (err) {
      setError('Error al procesar la identificación. Intente de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative radial gradients for modern look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Card className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 text-white rounded-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500"></div>
        
        <CardHeader className="pb-4 pt-8 px-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
              <Shield className="w-3.5 h-3.5" />
              Conexión Encriptada
            </div>
          </div>
          
          <div className="text-center mt-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-blue-500/15">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Identificación de Elector
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Ingrese su nombre y cédula para habilitar su boleta
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3 animate-headShake">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">
                Nombre Completo
              </label>
              <div className="relative">
                <Input
                  placeholder="Escriba su nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent py-3 pl-10"
                />
                <div className="absolute left-3.5 top-3.5 pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">
                Cédula / Identificación
              </label>
              <div className="relative">
                <Input
                  placeholder="Ej: 001-0000000-0"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent py-3 pl-10"
                />
                <div className="absolute left-3.5 top-3.5 pointer-events-none">
                  <Fingerprint className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !nombre.trim() || !cedula.trim()}
              className="w-full py-4.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-300 rounded-xl"
              isLoading={isLoading}
            >
              Habilitar Boleta
            </Button>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500/70" />
                El voto es secreto, seguro y auditado
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
