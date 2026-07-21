import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votoService } from '../services/votoService';
import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';
import { Users, Vote, TrendingUp, Power, Settings, BarChart3, UserPlus, Users2, LogOut, RefreshCw, ShieldAlert, Presentation } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const dashboardStats = await votoService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleToggleElection = async () => {
    setIsLoading(true);
    try {
      // 1. Obtener todas las elecciones registradas
      const { data: allElections, error: errAll } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (errAll) throw errAll;

      const activeElection = allElections?.find(e => e.estado === 'abierta');

      if (activeElection) {
        // Si hay una elección abierta, cerrarla
        const confirmed = window.confirm('¿Está seguro de que desea CERRAR la votación? Los electores ya no podrán emitir votos.');
        if (confirmed) {
          await supabase
            .from('elections')
            .update({ estado: 'cerrada' })
            .eq('id', activeElection.id);
          alert('La votación ha sido CERRADA con éxito.');
        }
      } else {
        // Si la votación está cerrada, abrirla
        const confirmed = window.confirm('¿Está seguro de que desea ABRIR la votación? Los electores podrán iniciar sesión y votar.');
        if (confirmed) {
          if (allElections && allElections.length > 0) {
            // Abrir la última elección existente
            await supabase
              .from('elections')
              .update({ estado: 'abierta' })
              .eq('id', allElections[0].id);
          } else {
            // Si no existe ninguna fila, crear una nueva abierta
            await supabase
              .from('elections')
              .insert({
                nombre: 'Elecciones Generales 2026',
                estado: 'abierta'
              });
          }
          alert('La votación ha sido ABIERTA con éxito.');
        }
      }

      await loadStats();
    } catch (err) {
      console.error('Error toggling election status:', err);
      alert('Ocurrió un error al cambiar el estado de la votación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetElection = async () => {
    const confirmed = window.confirm(
      '¡ATENCIÓN! Esta acción eliminará permanentemente TODOS los votos registrados y restablecerá a todos los votantes para que puedan votar nuevamente. Esta acción NO se puede deshacer.\n\n¿Está seguro de que desea reiniciar la elección?'
    );
    
    if (confirmed) {
      setIsLoading(true);
      try {
        await votoService.resetElection();
        alert('La elección ha sido reiniciada con éxito. Todos los votos fueron eliminados.');
        await loadStats();
      } catch (err) {
        console.error('Error resetting election:', err);
        alert('Ocurrió un error al reiniciar la elección. Por favor intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <nav className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Panel Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/resultados')}
                className="bg-white border-gray-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Resultados
              </Button>
              <Button 
                variant="danger" 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-white/80">Resumen general de la elección</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Votantes</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total_votantes}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Votos Emitidos</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.total_votos}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Vote className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participación</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.participacion.toFixed(1)}%</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-green-500/10"
              onClick={handleToggleElection}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado (Hacer Clic)</p>
                    <p className={`text-2xl font-bold mt-1 ${stats.estado_eleccion === 'abierta' ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.estado_eleccion === 'abierta' ? 'Abierta' : 'Cerrada'}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    stats.estado_eleccion === 'abierta' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse shadow-green-500/20' 
                      : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-red-500/20'
                  }`}>
                    <Power className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/admin/cargos')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Gestión de Cargos</h3>
                  <p className="text-sm text-gray-600">Administrar posiciones electivas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/admin/candidatos')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Gestión de Candidatos</h3>
                  <p className="text-sm text-gray-600">Registrar y editar candidatos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/admin/planchas')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Gestión de Planchas</h3>
                  <p className="text-sm text-gray-600">Administrar planchas electorales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/admin/votantes')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Gestión de Votantes</h3>
                  <p className="text-sm text-gray-600">Registrar votantes autorizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" onClick={() => navigate('/admin/resultados')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Resultados</h3>
                  <p className="text-sm text-gray-600">Ver resultados en tiempo real</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Fraud Monitoring and Audit Page */}
          <Card 
            className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 cursor-pointer hover:scale-105 transition-all duration-300" 
            onClick={() => navigate('/admin/auditoria')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Monitoreo de Fraude</h3>
                  <p className="text-sm text-gray-600">Revisar votos sospechosos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Reset Election Action Card */}
          <Card 
            className="bg-red-500/10 hover:bg-red-500/20 backdrop-blur-xl border border-red-500/25 cursor-pointer hover:scale-105 transition-all duration-300"
            onClick={handleResetElection}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                  <RefreshCw className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-red-200 text-lg">Reiniciar Elección</h3>
                  <p className="text-sm text-red-300/80">Borrar todos los votos actuales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modo Presentación Slide Deck */}
          <Card 
            className="bg-white/95 backdrop-blur-xl border border-amber-200 shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-amber-500/10" 
            onClick={() => navigate('/admin/presentacion')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Presentation className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
                    Modo Presentación
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Nuevo</span>
                  </h3>
                  <p className="text-sm text-gray-600">Diapositivas para exposición</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
