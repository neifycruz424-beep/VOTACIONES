import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votoService } from '../services/votoService';
import { planchaService } from '../services/planchaService';
import type { PositionResults, Plancha } from '../types';
import { ArrowLeft, Trophy, BarChart3, Medal, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AdminResults: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PositionResults[]>([]);
  const [planchas, setPlanchas] = useState<Plancha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanchaFilter, setSelectedPlanchaFilter] = useState<string>('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resultsData, planchasData] = await Promise.all([
        votoService.getAllResults(),
        planchaService.getAllPlanchas()
      ]);
      // Sort the position results by cargo.orden
      const sortedData = resultsData.sort((a, b) => a.cargo.orden - b.cargo.orden);
      setResults(sortedData);
      setPlanchas(planchasData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // General counts based on dynamic planchas for supremacy stats
  // General counts based on dynamic planchas for supremacy stats (returns actual plancha/voter count)
  const getPlanchaTotalVotes = (planchaId: string) => {
    // Buscar los resultados de Presidente
    const presResult = results.find(r => r.cargo.nombre.toLowerCase().includes('presidente'));
    if (presResult) {
      const candRes = presResult.resultados.find(res => res.candidato.plancha_id === planchaId);
      if (candRes) return candRes.total_votos;
    }
    
    // Si no hay presidente, buscar el máximo de votos de cualquier candidato de esta plancha
    let maxVotes = 0;
    results.forEach(pos => {
      pos.resultados.forEach(res => {
        if (res.candidato.plancha_id === planchaId && res.total_votos > maxVotes) {
          maxVotes = res.total_votos;
        }
      });
    });
    return maxVotes;
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedPlanchaName = planchas.find(p => p.id === selectedPlanchaFilter)?.nombre;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Contenido en pantalla (oculto al imprimir) */}
      <div className="print:hidden">
        {/* Decorative background blur elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[130px] animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/dashboard')} 
                  className="mr-4 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Resultados Electorales
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                {/* Plancha Filter Dropdown */}
                <select
                  value={selectedPlanchaFilter}
                  onChange={(e) => setSelectedPlanchaFilter(e.target.value)}
                  className="px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las Planchas</option>
                  {planchas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>

                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button 
                  onClick={loadData}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {results.length === 0 ? (
            <Card className="bg-slate-900/60 border border-white/10 text-white">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No hay resultados disponibles aún.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Supremacy Report Card (only shown when "Todas las Planchas" is selected) */}
              {!selectedPlanchaFilter && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-600 via-yellow-500 to-red-500"></div>
                  <CardContent className="p-6">                    <h2 className="text-xl font-bold tracking-tight text-white mb-5 text-center uppercase tracking-widest text-slate-300">
                      Reporte General de Supremacía
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      {/* Plancha 1 Stats */}
                      <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                        <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Total Votos - {planchas[0]?.nombre || 'Plancha 1'}</span>
                        {planchas[0]?.eslogan && <p className="text-[11px] text-blue-300/80 italic mt-0.5 font-medium">"{planchas[0]?.eslogan}"</p>}
                        <p className="text-4xl font-black text-white mt-2">{getPlanchaTotalVotes(planchas[0]?.id)}</p>
                      </div>
                      {/* Plancha 2 Stats */}
                      <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                        <span className="text-xs font-bold tracking-widest text-red-400 uppercase">Total Votos - {planchas[1]?.nombre || 'Plancha 2'}</span>
                        {planchas[1]?.eslogan && <p className="text-[11px] text-red-300/80 italic mt-0.5 font-medium">"{planchas[1]?.eslogan}"</p>}
                        <p className="text-4xl font-black text-white mt-2">{getPlanchaTotalVotes(planchas[1]?.id)}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col items-center justify-center p-5 border border-white/5 bg-slate-950/20 rounded-2xl text-center gap-2">
                      <p className="text-sm text-slate-400">Diferencia de votación general: <span className="text-white font-bold">{Math.abs(getPlanchaTotalVotes(planchas[0]?.id) - getPlanchaTotalVotes(planchas[1]?.id))} votos</span></p>
                      <div className={`mt-2 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border text-lg font-black uppercase tracking-wider ${
                        getPlanchaTotalVotes(planchas[0]?.id) > getPlanchaTotalVotes(planchas[1]?.id)
                          ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                          : getPlanchaTotalVotes(planchas[1]?.id) > getPlanchaTotalVotes(planchas[0]?.id)
                            ? 'text-red-400 border-red-500/30 bg-red-500/10'
                            : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      }`}>
                        <Trophy className="w-5 h-5 shrink-0" />
                        Supremacía: {
                          getPlanchaTotalVotes(planchas[0]?.id) > getPlanchaTotalVotes(planchas[1]?.id)
                            ? planchas[0]?.nombre
                            : getPlanchaTotalVotes(planchas[1]?.id) > getPlanchaTotalVotes(planchas[0]?.id)
                              ? planchas[1]?.nombre
                              : 'Empate Técnico'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Single Plancha Summary Card (shown when filtering by plancha) */}
              {selectedPlanchaFilter && (
                <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: planchas.find(p => p.id === selectedPlanchaFilter)?.color }}></div>
                  <CardContent className="p-6 text-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Total Votos Acumulados</span>
                    <h2 className="text-4xl font-black text-white mt-2">
                      {getPlanchaTotalVotes(selectedPlanchaFilter)}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Filtrado para la directiva de: <span className="font-semibold text-white">{selectedPlanchaName}</span></p>
                    {planchas.find(p => p.id === selectedPlanchaFilter)?.eslogan && (
                      <p className="text-xs text-slate-500 italic mt-1.5">"{planchas.find(p => p.id === selectedPlanchaFilter)?.eslogan}"</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {results.map((positionResult) => {
                const isVocal = positionResult.cargo.nombre.toLowerCase().includes('vocal');
                const maxWinners = isVocal ? 4 : 1;

                // Filter candidates inside this position based on search selection
                const filteredCandidatesList = selectedPlanchaFilter
                  ? positionResult.resultados.filter(r => r.candidato.plancha_id === selectedPlanchaFilter)
                  : positionResult.resultados;

                if (filteredCandidatesList.length === 0) return null;

                // Preparar datos para los gráficos:
                // Si es Vocal, agrupamos por plancha para evitar redundancia y mostrar colores oficiales
                const chartData = isVocal
                  ? planchas.map(plancha => {
                      const candidateRes = positionResult.resultados.find(
                        res => res.candidato.plancha_id === plancha.id
                      );
                      return {
                        name: plancha.nombre,
                        total_votos: candidateRes ? candidateRes.total_votos : 0,
                        porcentaje: candidateRes ? candidateRes.porcentaje : 0,
                        color: plancha.color || '#3B82F6',
                      };
                    }).sort((a, b) => b.total_votos - a.total_votos)
                  : filteredCandidatesList.map((res, index) => {
                      const plancha = planchas.find(p => p.id === res.candidato.plancha_id);
                      return {
                        name: res.candidato.nombre,
                        total_votos: res.total_votos,
                        porcentaje: res.porcentaje,
                        color: plancha?.color || COLORS[index % COLORS.length],
                      };
                    });

                return (
                  <Card key={positionResult.cargo.id} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-slate-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{positionResult.cargo.nombre}</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Criterio: {isVocal ? 'Ganan las 4 mejores votaciones (Vocales electos)' : 'Gana el candidato con mayor cantidad de votos'}
                        </p>
                      </div>
                      <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
                        Votos en cargo: <span className="text-white font-bold">{positionResult.total_votos}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 border-b border-white/5 pb-8">
                        {/* Bar Chart */}
                        <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5">
                          <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 text-center">Distribución de Votos</h3>
                          <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                              <Bar dataKey="total_votos" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5">
                          <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 text-center">Porcentaje de Voto</h3>
                          <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ x, y, textAnchor, name, payload }: any) => {
                                  const displayName = name || payload?.name || payload?.payload?.name || '';
                                  const displayPercent = payload?.porcentaje ?? payload?.payload?.porcentaje ?? 0;
                                  return (
                                    <text 
                                      x={x} 
                                      y={y} 
                                      fill="#fff" 
                                      textAnchor={textAnchor} 
                                      dominantBaseline="central"
                                      style={{ fontSize: '9px', fontWeight: '500' }}
                                    >
                                      {displayName}: {displayPercent.toFixed(1)}%
                                    </text>
                                  );
                                }}
                                outerRadius={75}
                                fill="#8884d8"
                                dataKey="total_votos"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Candidate list with custom winner highlights */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Escrutinio de Candidatos</h3>
                        {filteredCandidatesList.map((result, index) => {
                          const isWinner = index < maxWinners && result.total_votos > 0;

                          return (
                            <div
                              key={result.candidato.id}
                              className={`flex items-center justify-between p-4.5 rounded-xl transition-all border ${
                                isWinner
                                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                                  : 'bg-slate-950/30 border-white/5'
                              }`}
                            >
                              <div className="flex items-center space-x-4 min-w-0">
                                {result.candidato.foto ? (
                                  <img
                                    src={result.candidato.foto}
                                    alt={result.candidato.nombre}
                                    className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-slate-400 text-lg font-bold">
                                      {result.candidato.nombre.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-white text-base truncate">{result.candidato.nombre}</h3>
                                    {isWinner && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {isVocal ? (
                                          <>
                                            <Medal className="w-3 h-3 text-emerald-400" />
                                            Vocal Electo #{index + 1}
                                          </>
                                        ) : (
                                          <>
                                            <Trophy className="w-3 h-3 text-yellow-500" />
                                            Electo
                                          </>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full inline-block border border-white/10"
                                      style={{ backgroundColor: result.candidato.plancha?.color }}
                                    ></span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                      {result.candidato.plancha?.nombre}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-2xl font-black text-white">{result.total_votos}</p>
                                <p className="text-xs font-semibold text-slate-400 mt-0.5">{result.porcentaje.toFixed(1)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Acta de Impresión de Ganadores (visible solo en impresión) */}
      <div className="hidden print:block bg-white text-black p-8 min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="/company_logo.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Acta Oficial de Ganadores</h1>
              <p className="text-sm text-gray-500 font-medium">
                {selectedPlanchaFilter ? `Filtrado por: ${selectedPlanchaName}` : 'Elecciones Internas 2026'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Fecha de emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Reporte de Supremacía en PDF (only print when no filter is active) */}
        {!selectedPlanchaFilter ? (
          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl items-center text-center">
            <div className="p-3 border-r border-gray-200">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales - {planchas[0]?.nombre || 'Plancha 1'}</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{getPlanchaTotalVotes(planchas[0]?.id)}</p>
            </div>
            <div className="p-3">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales - {planchas[1]?.nombre || 'Plancha 2'}</span>
              <p className="text-3xl font-black text-red-600 mt-1">{getPlanchaTotalVotes(planchas[1]?.id)}</p>
            </div>
            <div className="col-span-2 text-center pt-3 border-t border-gray-200 text-xs font-bold text-gray-700">
              DIFERENCIA: {Math.abs(getPlanchaTotalVotes(planchas[0]?.id) - getPlanchaTotalVotes(planchas[1]?.id))} VOTOS • ELECCIÓN DE SUPREMACÍA: <span className="text-indigo-600 font-extrabold uppercase">{
                getPlanchaTotalVotes(planchas[0]?.id) > getPlanchaTotalVotes(planchas[1]?.id)
                  ? planchas[0]?.nombre
                  : getPlanchaTotalVotes(planchas[1]?.id) > getPlanchaTotalVotes(planchas[0]?.id)
                    ? planchas[1]?.nombre
                    : 'EMPATE'
              }</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl mb-8 text-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales Acumulados para la Directiva</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{getPlanchaTotalVotes(selectedPlanchaFilter)}</p>
          </div>
        )}

        <div className="space-y-6">
          {results.map((positionResult) => {
            const isVocal = positionResult.cargo.nombre.toLowerCase().includes('vocal');
            const maxWinners = isVocal ? 4 : 1;

            const filteredCandidatesList = selectedPlanchaFilter
              ? positionResult.resultados.filter(r => r.candidato.plancha_id === selectedPlanchaFilter)
              : positionResult.resultados;

            const winners = filteredCandidatesList.filter((_, idx) => idx < maxWinners && _.total_votos > 0);

            if (winners.length === 0) return null;

            return (
              <div key={positionResult.cargo.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Cargo: {positionResult.cargo.nombre}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {winners.map((result, idx) => (
                    <div key={result.candidato.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      {result.candidato.foto ? (
                        <img src={result.candidato.foto} alt={result.candidato.nombre} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">
                          {result.candidato.nombre.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-snug">{result.candidato.nombre}</h3>
                        <p className="text-xs text-blue-600 font-bold mt-0.5">
                          {isVocal ? `Vocal Electo #${idx + 1}` : 'Candidato Electo'}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          Plancha: {result.candidato.plancha?.nombre} • Votos: {result.total_votos} ({result.porcentaje.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Anexo de Gráficos de Resultados (visible solo en impresión, forzando salto de página) */}
        <div style={{ pageBreakBefore: 'always' }} className="pt-8 mt-8">
          <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img src="/company_logo.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Anexo Estadístico: Gráficos de Votación</h1>
                <p className="text-sm text-gray-500 font-medium">Distribución y porcentaje de votos por cada cargo electivo</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {results.map((positionResult) => {
              const isVocal = positionResult.cargo.nombre.toLowerCase().includes('vocal');
              
              const filteredCandidatesList = selectedPlanchaFilter
                ? positionResult.resultados.filter(r => r.candidato.plancha_id === selectedPlanchaFilter)
                : positionResult.resultados;

              if (filteredCandidatesList.length === 0) return null;

              // Agrupar datos por plancha para versión de impresión
              const printChartData = isVocal
                ? planchas.map(plancha => {
                    const candidateRes = positionResult.resultados.find(
                      res => res.candidato.plancha_id === plancha.id
                    );
                    return {
                      name: plancha.nombre,
                      total_votos: candidateRes ? candidateRes.total_votos : 0,
                      porcentaje: candidateRes ? candidateRes.porcentaje : 0,
                      color: plancha.color || '#3B82F6',
                    };
                  }).sort((a, b) => b.total_votos - a.total_votos)
                : filteredCandidatesList.map((res, index) => {
                    const plancha = planchas.find(p => p.id === res.candidato.plancha_id);
                    return {
                      name: res.candidato.nombre,
                      total_votos: res.total_votos,
                      porcentaje: res.porcentaje,
                      color: plancha?.color || COLORS[index % COLORS.length],
                    };
                  });

              return (
                <div key={positionResult.cargo.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50" style={{ pageBreakInside: 'avoid' }}>
                  <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Gráficos de Resultados - {positionResult.cargo.nombre}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                    {/* Gráfico de Barras para Impresión */}
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider mb-3">Distribución de Votos</p>
                      <BarChart width={320} height={180} data={printChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} height={30} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                        <Bar dataKey="total_votos" radius={[3, 3, 0, 0]}>
                          {printChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </div>

                    {/* Gráfico Circular para Impresión */}
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider mb-3">Porcentaje de Votación</p>
                      <PieChart width={320} height={180}>
                        <Pie
                          data={printChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ x, y, textAnchor, name, payload }: any) => {
                            const displayName = name || payload?.name || payload?.payload?.name || '';
                            const displayPercent = payload?.porcentaje ?? payload?.payload?.porcentaje ?? 0;
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill="#374151" 
                                textAnchor={textAnchor} 
                                dominantBaseline="central"
                                style={{ fontSize: '9px', fontWeight: '600' }}
                              >
                                {displayName}: {displayPercent.toFixed(1)}%
                              </text>
                            );
                          }}
                          outerRadius={55}
                          fill="#8884d8"
                          dataKey="total_votos"
                        >
                          {printChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
