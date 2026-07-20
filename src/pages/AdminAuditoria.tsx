import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { votoService } from '../services/votoService';
import { ArrowLeft, ShieldAlert, Check, Trash2, ShieldCheck, AlertTriangle, Printer } from 'lucide-react';

interface SuspiciousSession {
  votanteId: string;
  votante: {
    nombre: string;
    codigo: string;
  };
  motivo: string;
  fecha: string;
  candidatosVotados: string[];
}

export const AdminAuditoria: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SuspiciousSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadSuspiciousVotes();
  }, [navigate]);

  const loadSuspiciousVotes = async () => {
    setIsLoading(true);
    try {
      const votes = await votoService.getSuspiciousVotes();
      
      // Group votes by voter to create unified voting sessions
      const grouped: { [key: string]: SuspiciousSession } = {};
      
      votes.forEach((vote) => {
        const vId = vote.votante_id;
        if (!grouped[vId] && vote.votante) {
          grouped[vId] = {
            votanteId: vId,
            votante: {
              nombre: vote.votante.nombre,
              codigo: vote.votante.codigo,
            },
            motivo: vote.motivo_sospecha || 'Sospecha de duplicidad de nombre',
            fecha: vote.fecha,
            candidatosVotados: [],
          };
        }
        
        if (grouped[vId] && vote.candidato) {
          grouped[vId].candidatosVotados.push(
            `${vote.candidato.nombre} (${vote.cargo?.nombre || 'Candidato'})`
          );
        }
      });

      setSessions(Object.values(grouped));
    } catch (err) {
      console.error('Error loading suspicious votes:', err);
      setError('Ocurrió un error al cargar la auditoría de fraudes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (votanteId: string) => {
    if (window.confirm('¿Está seguro de VALIDAR este voto? Se eliminará la sospecha y el voto se sumará al escrutinio oficial.')) {
      try {
        await votoService.approveVote(votanteId);
        alert('El voto ha sido validado correctamente.');
        loadSuspiciousVotes();
      } catch (err) {
        console.error('Error approving vote:', err);
        alert('Error al validar el voto.');
      }
    }
  };

  const handleReject = async (votanteId: string) => {
    if (window.confirm('¡ATENCIÓN! ¿Está seguro de ANULAR este voto? Los votos del elector se eliminarán permanentemente de la base de datos y su estado se restablecerá a "pendiente".')) {
      try {
        await votoService.rejectVote(votanteId);
        alert('El voto ha sido anulado con éxito.');
        loadSuspiciousVotes();
      } catch (err) {
        console.error('Error rejecting vote:', err);
        alert('Error al anular el voto.');
      }
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
      {/* Contenido en pantalla (oculto al imprimir) */}
      <div className="print:hidden">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Auditoría y Monitoreo de Fraudes
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                {sessions.length} Votos Bandera Roja
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <Card className="border border-green-200 bg-green-50/30">
            <CardContent className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800">¡Elecciones Limpias!</h2>
              <p className="text-green-700 text-sm max-w-md">
                No se han detectado votos con sospecha de fraude o similitud en este momento. Todos los votos emitidos han cumplido con las reglas de seguridad.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Nota de Seguridad:</strong> Los votos que se listan abajo están **en suspenso** y sus cifras **NO se reflejan en las gráficas de ganadores ni resultados** hasta que un administrador los apruebe manualmente.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => (
                <Card key={session.votanteId} className="border-red-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {session.votante.nombre}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                          <p>Cédula: <span className="font-semibold text-gray-900 font-mono">{session.votante.codigo}</span></p>
                          <p>Fecha: <span className="font-semibold text-gray-900">{new Date(session.fecha).toLocaleString()}</span></p>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-800">
                          Motivo de Sospecha: {session.motivo}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gabinete Votado:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {session.candidatosVotados.map((cand, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                {cand}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                        <Button 
                          onClick={() => handleApprove(session.votanteId)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Aprobar Voto
                        </Button>
                        <Button 
                          variant="danger"
                          onClick={() => handleReject(session.votanteId)}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Anular Voto
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Acta de Impresión de Auditoría (visible solo en impresión) */}
      <div className="hidden print:block bg-white text-black p-8 min-h-screen">
        <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="/company_logo.png" alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-300 shadow-sm" />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">Reporte de Auditoría de Elección</h1>
              <p className="text-sm text-gray-500 font-medium">Incidentes de Seguridad y Sospechas de Duplicidad</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Emisión: {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-red-600 font-bold mt-1">Alertas Activas: {sessions.length}</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
            <p className="text-lg font-bold text-green-800">No se detectaron incidentes de seguridad.</p>
            <p className="text-sm text-gray-500 mt-1">Todos los votos registrados son legítimos y no presentan sospechas de duplicidad.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xs text-gray-500 mb-4 font-semibold">
              Este documento contiene el desglose de los votos en suspenso que han sido retenidos por sospecha de fraude o duplicidad de identidad. Estos votos han sido excluidos del conteo oficial y requieren resolución manual de la comisión electoral.
            </p>

            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 p-2.5 text-left font-bold">Elector</th>
                  <th className="border border-gray-300 p-2.5 text-left font-bold">Cédula</th>
                  <th className="border border-gray-300 p-2.5 text-left font-bold">Fecha / Hora</th>
                  <th className="border border-gray-300 p-2.5 text-left font-bold">Motivo de la Sospecha</th>
                  <th className="border border-gray-300 p-2.5 text-left font-bold">Gabinete Votado</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.votanteId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2.5 font-bold text-gray-900">{session.votante.nombre}</td>
                    <td className="border border-gray-300 p-2.5 font-mono text-gray-700">{session.votante.codigo}</td>
                    <td className="border border-gray-300 p-2.5 text-gray-600">{new Date(session.fecha).toLocaleString()}</td>
                    <td className="border border-gray-300 p-2.5 text-red-800 bg-red-50/30 font-medium">{session.motivo}</td>
                    <td className="border border-gray-300 p-2.5 text-gray-700">
                      {session.candidatosVotados.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature section */}
        <div className="mt-20 pt-12 border-t border-gray-200 flex flex-col items-center">
          <div className="text-center w-64">
            <div className="border-b border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Encargado de Elecciones</p>
            <p className="text-[10px] text-gray-400">Firma y Sello</p>
          </div>
        </div>
      </div>
    </div>
  );
};
