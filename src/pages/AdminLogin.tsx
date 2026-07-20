import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Lock, ArrowLeft, Shield, Sparkles } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Credenciales inválidas');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-white">
      {/* Decorative background blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Card className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 text-white rounded-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500"></div>
        
        <CardHeader className="pb-4 pt-8 px-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
          
          <div className="text-center mt-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/company_logo.jpg" 
                alt="Logo" 
                className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg shadow-blue-500/15"
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Acceso Administrativo
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Ingrese sus credenciales de administrador
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="admin@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  required
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent py-3 pl-10"
                />
                <div className="absolute left-3.5 top-3.5 pointer-events-none">
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="bg-slate-950/60 border-white/10 text-white placeholder-slate-500 focus:ring-blue-500 focus:border-transparent py-3 pl-10"
                />
                <div className="absolute left-3.5 top-3.5 pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4.5 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl"
              isLoading={isLoading}
              disabled={!email.trim() || !password.trim()}
            >
              Iniciar Sesión
            </Button>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500/70" />
                Acceso restringido de alta seguridad
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
