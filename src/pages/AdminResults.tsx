import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votoService } from '../services/votoService';
import type { PositionResults } from '../types';
import { ArrowLeft, Trophy, BarChart3 } from 'lucide-react';
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
      setResults(data);
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Resultados Electorales</h1>
            </div>
            <Button onClick={loadResults}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">No hay resultados disponibles aún.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {results.map((positionResult) => (
              <Card key={positionResult.cargo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{positionResult.cargo.nombre}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Total votos: {positionResult.total_votos}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {positionResult.resultados.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No hay votos registrados para este cargo.</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={positionResult.resultados}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="candidato.nombre" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total_votos" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={positionResult.resultados}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry: any) => {
                                const result = positionResult.resultados.find(r => r.candidato.nombre === entry.payload.candidato.nombre);
                                return result ? `${result.candidato.nombre}: ${result.porcentaje.toFixed(1)}%` : '';
                              }}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="total_votos"
                            >
                              {positionResult.resultados.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 space-y-4">
                    {positionResult.resultados.map((result, index) => (
                      <div
                        key={result.candidato.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          index === 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {result.candidato.foto ? (
                            <img
                              src={result.candidato.foto}
                              alt={result.candidato.nombre}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">{result.candidato.nombre.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{result.candidato.nombre}</h3>
                              {index === 0 && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                            <div
                              className="inline-block px-2 py-1 rounded text-xs text-white mt-1"
                              style={{ backgroundColor: result.candidato.plancha?.color }}
                            >
                              {result.candidato.plancha?.nombre}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{result.total_votos}</p>
                          <p className="text-sm text-gray-600">{result.porcentaje.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
