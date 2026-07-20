import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Lock, ArrowLeft, Shield } from 'lucide-react';

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

    // Simple authentication check (in production, use proper auth)
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
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Acceso Administrativo
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Ingrese sus credenciales para acceder al panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="text-lg"
              />
              <div className="absolute right-3 top-9">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="text-lg"
              />
              <div className="absolute right-3 top-9">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              isLoading={isLoading}
              disabled={!email.trim() || !password.trim()}
            >
              Iniciar Sesión
            </Button>

            <p className="text-center text-sm text-gray-500">
              Área restringida para personal autorizado
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
