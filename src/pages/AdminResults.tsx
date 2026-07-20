import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votoService } from '../services/votoService';
import type { PositionResults } from '../types';
import { ArrowLeft, Trophy, BarChart3, Medal, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AdminResults: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PositionResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadResults();
  }, [navigate]);

  const loadResults = async () => {
    try {
      const data = await votoService.getAllResults();
      // Sort the position results by cargo.orden
      const sortedData = data.sort((a, b) => a.cargo.orden - b.cargo.orden);
      setResults(sortedData);
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute total votes for each plancha to calculate supremacy
  const totalVotesP1 = results
    .filter(r => r.cargo.nombre.toLowerCase().includes('plancha 1'))
    .reduce((sum, r) => sum + r.total_votos, 0);

  const totalVotesP2 = results
    .filter(r => r.cargo.nombre.toLowerCase().includes('plancha 2'))
    .reduce((sum, r) => sum + r.total_votos, 0);

  const diffVotes = Math.abs(totalVotesP1 - totalVotesP2);

  let supremacyMessage = '';
  let supremacyColorClass = '';
  if (totalVotesP1 > totalVotesP2) {
    supremacyMessage = 'Plancha 1';
    supremacyColorClass = 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-blue-500/5';
  } else if (totalVotesP2 > totalVotesP1) {
    supremacyMessage = 'Plancha 2';
    supremacyColorClass = 'text-red-400 border-red-500/30 bg-red-500/10 shadow-red-500/5';
  } else {
    supremacyMessage = 'Empate Técnico';
    supremacyColorClass = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button 
                  onClick={loadResults}
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
              {/* Supremacy Report Card */}
              <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-yellow-500 to-red-500"></div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold tracking-tight text-white mb-5 text-center uppercase tracking-widest text-slate-300">
                    Reporte General de Supremacía
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Plancha 1 Stats */}
                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                      <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">Total Votos - Plancha 1</span>
                      <p className="text-4xl font-black text-white mt-2">{totalVotesP1}</p>
                    </div>
                    {/* Plancha 2 Stats */}
                    <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                      <span className="text-xs font-bold tracking-widest text-red-400 uppercase">Total Votos - Plancha 2</span>
                      <p className="text-4xl font-black text-white mt-2">{totalVotesP2}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col items-center justify-center p-5 border border-white/5 bg-slate-950/20 rounded-2xl text-center gap-2">
                    <p className="text-sm text-slate-400">Diferencia de votación general: <span className="text-white font-bold">{diffVotes} votos</span></p>
                    <div className={`mt-2 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border text-lg font-black uppercase tracking-wider ${supremacyColorClass}`}>
                      <Trophy className="w-5 h-5 shrink-0" />
                      Supremacía: {supremacyMessage}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {results.map((positionResult) => {
                const isVocal = positionResult.cargo.nombre.toLowerCase().includes('vocal');
                const maxWinners = isVocal ? 4 : 1;

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
                        Total votos: <span className="text-white font-bold">{positionResult.total_votos}</span>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      {positionResult.resultados.length === 0 ? (
                        <p className="text-slate-500 text-center py-8 text-sm">No hay votos registrados para este cargo.</p>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 border-b border-white/5 pb-8">
                            {/* Bar Chart */}
                            <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5">
                              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 text-center">Distribución de Votos</h3>
                              <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={positionResult.resultados}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                  <XAxis dataKey="candidato.nombre" stroke="#94a3b8" angle={-15} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
                                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                                  <Bar dataKey="total_votos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5">
                              <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4 text-center">Porcentaje de Voto</h3>
                              <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                  <Pie
                                    data={positionResult.resultados}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={(entry: any) => {
                                      const result = positionResult.resultados.find(r => r.candidato.nombre === entry.payload.candidato.nombre);
                                      return result ? `${result.candidato.nombre}: ${result.porcentaje.toFixed(1)}%` : '';
                                    }}
                                    outerRadius={75}
                                    fill="#8884d8"
                                    dataKey="total_votos"
                                  >
                                    {positionResult.resultados.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                            {positionResult.resultados.map((result, index) => {
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
                        </>
                      )}
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
              <p className="text-sm text-gray-500 font-medium">Elecciones Internas 2026</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Fecha de emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Reporte de Supremacía en PDF */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl items-center">
          <div className="text-center p-3 border-r border-gray-200">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales - Plancha 1</span>
            <p className="text-3xl font-black text-blue-600 mt-1">{totalVotesP1}</p>
          </div>
          <div className="text-center p-3">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales - Plancha 2</span>
            <p className="text-3xl font-black text-red-600 mt-1">{totalVotesP2}</p>
          </div>
          <div className="col-span-2 text-center pt-3 border-t border-gray-200 text-xs font-bold text-gray-700">
            DIFERENCIA: {diffVotes} VOTOS • ELECCIÓN DE SUPREMACÍA: <span className="text-indigo-600 font-extrabold uppercase">{totalVotesP1 > totalVotesP2 ? 'PLANCHA 1' : totalVotesP2 > totalVotesP1 ? 'PLANCHA 2' : 'EMPATE'}</span>
          </div>
        </div>

        <div className="space-y-6">
          {results.map((positionResult) => {
            const isVocal = positionResult.cargo.nombre.toLowerCase().includes('vocal');
            const maxWinners = isVocal ? 4 : 1;
            const winners = positionResult.resultados.filter((_, idx) => idx < maxWinners && _.total_votos > 0);

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
      </div>
    </div>
  );
};
