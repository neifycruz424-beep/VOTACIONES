import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { planchaService } from '../services/planchaService';
import { votoService } from '../services/votoService';
import { votanteService } from '../services/votanteService';
import { obtenerUrlDirectaDrive } from '../utils/cedulaValidador';
import { supabase } from '../lib/supabase';
import type { PositionResults, Plancha } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Trophy, 
  ShieldAlert, 
  Users, 
  Vote, 
  TrendingUp, 
  Presentation,
  Award,
  Lock,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  BarChart4
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from 'recharts';

export const AdminPresentation: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PositionResults[]>([]);
  const [planchas, setPlanchas] = useState<Plancha[]>([]);
  const [totalVotantes, setTotalVotantes] = useState(0);
  const [totalVotos, setTotalVotos] = useState(0);
  const [totalSospechosos, setTotalSospechosos] = useState(0);
  const [estadoEleccion, setEstadoEleccion] = useState('cerrada');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [navigate]);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isFullscreen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live results & planchas
      const [resultsData, planchasData, allVotantes] = await Promise.all([
        votoService.getAllResults(),
        planchaService.getAllPlanchas(),
        votanteService.getAllVotantes()
      ]);

      // Sort the position results by cargo.orden
      const sortedData = resultsData.sort((a, b) => a.cargo.orden - b.cargo.orden);
      setResults(sortedData);
      setPlanchas(planchasData);

      // 2. Fetch election state
      const { data: election } = await supabase
        .from('elections')
        .select('estado')
        .eq('nombre', 'Elecciones Generales 2026')
        .maybeSingle();
      
      if (election) {
        setEstadoEleccion(election.estado);
      }

      // 3. Calculate statistics
      const totalRegistered = allVotantes.length;
      setTotalVotantes(totalRegistered);

      // Get count of actual voters who voted
      const votedCount = allVotantes.filter(v => v.ya_voto).length;
      setTotalVotos(votedCount);

      // 4. Fetch suspicious sessions count
      const { count } = await supabase
        .from('votos_sospechosos')
        .select('*', { count: 'exact', head: true });
      setTotalSospechosos(count || 0);

    } catch (err) {
      console.error('Error loading presentation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanchaTotalVotes = (planchaId: string) => {
    const presResult = results.find(r => r.cargo.nombre.toLowerCase().includes('presidente'));
    if (presResult) {
      const candRes = presResult.resultados.find(res => res.candidato.plancha_id === planchaId);
      if (candRes) return candRes.total_votos;
    }
    
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

  const getWinnerPlancha = () => {
    if (planchas.length === 0) return null;
    let winner = planchas[0];
    let maxVotes = getPlanchaTotalVotes(planchas[0].id);
    
    planchas.forEach(p => {
      const votes = getPlanchaTotalVotes(p.id);
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = p;
      }
    });
    return { plancha: winner, votes: maxVotes };
  };

  const winnerData = getWinnerPlancha();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Slides count changed to 10 to fit the new Committees slide
  const slidesCount = 10;

  const nextSlide = () => {
    if (currentSlide < slidesCount - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 text-sm animate-pulse">Compilando datos para la presentación...</p>
      </div>
    );
  }

  const participacionPct = totalVotantes > 0 ? (totalVotos / totalVotantes) * 100 : 0;
  const abstencionPct = 100 - participacionPct;
  const totalAbstencion = Math.max(0, totalVotantes - totalVotos);

  // Turnout chart data
  const turnoutData = [
    { name: 'Votaron', value: totalVotos, color: '#10B981' },
    { name: 'Abstención', value: totalAbstencion, color: '#EF4444' }
  ];

  // Vocales chart data
  const vocalesResult = results.find(r => r.cargo.nombre.toLowerCase().includes('vocal'));
  const vocalesChartData = vocalesResult?.resultados.map(res => {
    const planchaColor = res.candidato.plancha?.color || '#3B82F6';
    return {
      name: res.candidato.plancha?.nombre || 'Independiente',
      votos: res.total_votos,
      porcentaje: res.porcentaje,
      color: planchaColor,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden flex flex-col justify-between select-none">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <img src="/company_logo.png" alt="Logo" className="w-9 h-9 rounded-lg object-cover border border-white/10 shadow-md" />
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-widest text-slate-200">Informe Electoral 2026</h1>
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Modo Exposición Plenaria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleFullscreen}
            className="border-white/5 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg text-xs py-1.5 px-3"
          >
            {isFullscreen ? (
              <><Minimize2 className="w-3.5 h-3.5 mr-1.5" /> Salir Pantalla</>
            ) : (
              <><Maximize2 className="w-3.5 h-3.5 mr-1.5" /> Pantalla Completa</>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="border-white/5 bg-red-500/10 hover:bg-red-500/20 text-red-200 hover:text-white rounded-lg text-xs py-1.5 px-3"
          >
            <X className="w-3.5 h-3.5 mr-1.5" />
            Cerrar
          </Button>
        </div>
      </header>

      {/* Main Slides Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex items-center justify-center relative z-10">
        
        {/* SLIDE 0: TITLE PORTADA */}
        {currentSlide === 0 && (
          <div className="text-center space-y-6 max-w-3xl animate-fadeIn">
            <div className="flex justify-center">
              <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 rounded-3xl p-1 shadow-2xl shadow-blue-500/20">
                <img src="/company_logo.png" alt="Logo Grande" className="w-full h-full object-cover rounded-[22px] bg-slate-900" />
              </div>
            </div>
            
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-bold text-blue-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Proceso Concluido
              </span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                INFORME DE PROCESO ELECTORAL 2026
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium tracking-wide">
                Elecciones de la Junta Directiva Institucional
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8 text-left max-w-lg mx-auto">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Presentador</p>
                <p className="text-sm font-bold text-slate-300">Neify Cruz</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fecha</p>
                <p className="text-sm font-bold text-slate-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: FICHA TECNICA */}
        {currentSlide === 1 && (
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 02</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Ficha Técnica de las Elecciones</h2>
              <p className="text-slate-400 text-sm">Resumen de participación y estado del proceso de votación</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col justify-between h-44 shadow-lg hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Padrón Electoral</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-4xl font-black text-white">{totalVotantes}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Electores Registrados</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col justify-between h-44 shadow-lg hover:border-green-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Participación Real</span>
                  <Vote className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-4xl font-black text-white">{totalVotos}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Electores que Votaron</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col justify-between h-44 shadow-lg hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Porcentaje</span>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-4xl font-black text-white">{participacionPct.toFixed(1)}%</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Nivel de Asistencia</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col justify-between h-44 shadow-lg hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estado Urnas</span>
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className={`text-3xl font-black uppercase ${estadoEleccion === 'abierta' ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                    {estadoEleccion === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-2">Estado de Votación</p>
                </div>
              </div>

            </div>

            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center md:text-left text-xs text-slate-400 leading-relaxed max-w-4xl">
              <strong className="text-blue-300 font-bold">Nota de Proceso:</strong> El quórum reglamentario establecido por los estatutos exige una participación mínima del 50.0% de los votantes activos registrados en el padrón. Con un nivel de asistencia real del <strong className="text-white font-bold">{participacionPct.toFixed(1)}%</strong>, la jornada electoral queda validada con plena representatividad institucional.
            </div>
          </div>
        )}

        {/* SLIDE 2: ANALISIS DE PARTICIPACION */}
        {currentSlide === 2 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 03</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Análisis Gráfico de Participación vs Abstención</h2>
              <p className="text-slate-400 text-sm">Distribución porcentual de asistencia a las urnas y abstencionismo electoral</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* Turnout metrics box */}
              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  Métricas de Afluencia
                </h3>
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-white/5">
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>Votos Emitidos</span>
                      <span className="text-emerald-400 font-extrabold">{participacionPct.toFixed(1)}%</span>
                    </div>
                    <p className="text-2xl font-black text-white mt-1">{totalVotos} Electores</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ejercieron activamente su derecho al voto.</p>
                  </div>

                  <div className="pb-1">
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>Abstención / Ausencia</span>
                      <span className="text-red-400 font-extrabold">{abstencionPct.toFixed(1)}%</span>
                    </div>
                    <p className="text-2xl font-black text-white mt-1">{totalAbstencion} Electores</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Electores ausentes en la jornada.</p>
                  </div>
                </div>
              </div>

              {/* Turnout Pie Chart */}
              <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-white/10 rounded-3xl h-[280px] flex items-center justify-center shadow-2xl relative">
                <div className="absolute top-4 left-6 flex items-center gap-4 text-xs text-slate-300 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Votaron ({participacionPct.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Abstención ({abstencionPct.toFixed(1)}%)</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={turnoutData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                      outerRadius={80}
                      dataKey="value"
                      stroke="rgba(15, 23, 42, 0.6)"
                      strokeWidth={2}
                    >
                      {turnoutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 3: RETOS Y DESAFIOS DEL PROCESO ELECTORAL */}
        {currentSlide === 3 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 04</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Retos y Desafíos del Proceso Electoral</h2>
              <p className="text-slate-400 text-sm">Superando las barreras de seguridad, logística y tecnología institucional</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between hover:border-red-500/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Seguridad e Identidad</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El gran desafío fue impedir la suplantación de identidad y el doble voto. Se resolvió integrando validación matemática de cédula y un algoritmo de similitud fonética en tiempo real.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-0.5">Slogan del Desafío</span>
                  <p className="text-xs font-semibold text-slate-200 italic">"Integridad absoluta en cada voto registrado"</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between hover:border-blue-500/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Logística y Adopción</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Migrar de urnas de cartón tradicionales a una urna digital requirió diseñar una interfaz muy sencilla, intuitiva y rápida, garantizando accesibilidad total para todo el padrón.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Slogan del Desafío</span>
                  <p className="text-xs font-semibold text-slate-200 italic">"La urna al alcance de un clic, sin exclusiones"</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between hover:border-green-500/20 transition-all">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Transparencia y Cómputo</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Eliminar el conteo manual propenso a errores y sospechas. Se logró procesando y graficando los resultados de forma automática e inmediata tras el cierre de las urnas.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block mb-0.5">Slogan del Desafío</span>
                  <p className="text-xs font-semibold text-slate-200 italic">"Escrutinio auditable al instante del cierre"</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 4: LAS PLANCHAS ELECTORALES */}
        {currentSlide === 4 && (
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 05</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Planchas Electorales Nominadas</h2>
              <p className="text-slate-400 text-sm">Organizaciones políticas que se postularon para conformar la directiva</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {planchas.map((plancha) => (
                <div 
                  key={plancha.id} 
                  className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-xl hover:scale-[1.01] transition-all"
                >
                  <div 
                    className="absolute top-0 left-0 w-2 h-full" 
                    style={{ backgroundColor: plancha.color }}
                  />
                  
                  <div className="flex items-start gap-4">
                    {plancha.logo ? (
                      <img 
                        src={obtenerUrlDirectaDrive(plancha.logo)} 
                        alt={plancha.nombre} 
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg bg-white/5 shrink-0" 
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0"
                        style={{ backgroundColor: plancha.color }}
                      >
                        {plancha.nombre.charAt(0)}
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{plancha.nombre}</h3>
                      {plancha.eslogan && (
                        <p className="text-xs text-slate-400 italic">"{plancha.eslogan}"</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: plancha.color }}></span>
                      <span>Color Distintivo: <strong className="text-slate-200">{plancha.color}</strong></span>
                    </div>
                    <div>
                      <span>Votos Obtenidos: <strong className="text-white font-extrabold">{getPlanchaTotalVotes(plancha.id)}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 5: SEGURIDAD Y ANTIFRAUDE */}
        {currentSlide === 5 && (
          <div className="w-full space-y-8 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 06</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Garantía de Transparencia y Antifraude</h2>
              <p className="text-slate-400 text-sm">Medidas de seguridad criptográfica y auditoría en tiempo real</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-slate-200">Validación de Cédula JCE</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Implementación del algoritmo Luhn oficial para detectar cédulas dominicanas inválidas o inventadas en el portal de entrada.
                </p>
              </div>

              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-slate-200">Algoritmo de Similitud</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Comparador fonético de cadenas de texto (Levensthein) para evitar que una persona vote dos veces utilizando cédulas alternas con nombres idénticos o extremadamente similares.
                </p>
              </div>

              <div className="p-6 bg-red-950/10 border border-red-500/15 rounded-2xl space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-bold text-red-200">Retención de Sospechas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aislamiento preventivo e inmediato de votos con banderas rojas. Los votos sospechosos no se suman automáticamente y requieren auditoría del administrador.
                </p>
              </div>

            </div>

            <div className="p-6 bg-slate-900/80 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="font-bold text-slate-200">Estado de Auditoría en Vivo</h4>
                <p className="text-xs text-slate-400">Total de intentos o votos retenidos y evaluados por el Comité de Auditoría</p>
              </div>
              
              <div className="px-8 py-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block">Votos Retenidos (Bandera Roja)</span>
                <p className="text-3xl font-black text-red-200 mt-1">{totalSospechosos} VOTOS</p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 6: GRAFICO DE RESULTADOS GENERALES (SUPREMACIA) */}
        {currentSlide === 6 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 07</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Distribución de Resultados Electorales (Supremacía)</h2>
              <p className="text-slate-400 text-sm">Gráfico comparativo del caudal electoral de las planchas directivas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* Table stats */}
              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Resumen de Votos</h3>
                <div className="space-y-3">
                  {planchas.map((plancha) => {
                    const votes = getPlanchaTotalVotes(plancha.id);
                    const pct = totalVotos > 0 ? (votes / totalVotos) * 100 : 0;

                    return (
                      <div key={plancha.id} className="pb-3 border-b border-white/5 last:border-0">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: plancha.color }} />
                            <span>{plancha.nombre}</span>
                          </div>
                          <span>{votes} votos</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: plancha.color }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-bold">
                          <span>Eslogan: {plancha.eslogan || 'Sin eslogan'}</span>
                          <span>{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Chart render */}
              <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-white/10 rounded-3xl h-[280px] flex items-center justify-center shadow-2xl relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planchas.map(p => ({ name: p.nombre, votos: getPlanchaTotalVotes(p.id), color: p.color }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                    <Bar dataKey="votos" radius={[8, 8, 0, 0]}>
                      {planchas.map((p, index) => (
                        <Cell key={`cell-${index}`} fill={p.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 7: RESULTADOS DETALLADOS - VOCALES */}
        {currentSlide === 7 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 08</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Escrutinio Específico: Vocales de la Directiva</h2>
              <p className="text-slate-400 text-sm">Distribución y porcentaje de votos para la representación de Vocales</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* Vocales metrics list */}
              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <BarChart4 className="w-4 h-4 text-indigo-400" />
                  Votos de Vocales
                </h3>
                
                <div className="space-y-3">
                  {vocalesChartData.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No hay registros de vocales en esta elección.</p>
                  ) : (
                    vocalesChartData.map((data, idx) => (
                      <div key={idx} className="pb-2 border-b border-white/5 last:border-0 text-xs font-bold">
                        <div className="flex justify-between items-center text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                            <span>{data.name}</span>
                          </div>
                          <span className="font-mono text-slate-300">{data.votos} votos</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                          <span>Porcentaje</span>
                          <span style={{ color: data.color }}>{data.porcentaje.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Vocales Pie Chart */}
              <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-white/10 rounded-3xl h-[280px] flex items-center justify-center shadow-2xl relative">
                {vocalesChartData.length === 0 ? (
                  <p className="text-slate-400 font-bold">Sin datos para graficar</p>
                ) : (
                  <>
                    <div className="absolute top-4 left-6 flex flex-wrap items-center gap-4 text-[10px] text-slate-300 font-bold max-w-[80%]">
                      {vocalesChartData.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                          <span>{entry.name} ({entry.porcentaje.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vocalesChartData}
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
                                style={{ fontSize: '10px', fontWeight: '500' }}
                              >
                                {displayName}: {displayPercent.toFixed(1)}%
                              </text>
                            );
                          }}
                          outerRadius={75}
                          dataKey="votos"
                          stroke="rgba(15, 23, 42, 0.6)"
                          strokeWidth={2}
                        >
                          {vocalesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SLIDE 8: ADJUDICACION DE DIRECTIVA GANADORA */}
        {currentSlide === 8 && (
          <div className="w-full space-y-6 animate-fadeIn">
            <div className="text-center md:text-left space-y-1.5">
              <span className="text-xs text-blue-400 font-extrabold uppercase tracking-widest">Diapositiva 09</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Directiva Electa Proclamada</h2>
              <p className="text-slate-400 text-sm">Gabinete de candidatos ganadores que asumirá los cargos institucionales</p>
            </div>

            {winnerData && winnerData.plancha ? (
              <div className="space-y-6">
                
                {/* Ribbon of victory */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/20 to-amber-500/10 border-y border-amber-500/30 text-center flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 rounded-xl">
                  <Trophy className="w-6 h-6 text-yellow-400 animate-bounce shrink-0" />
                  <p className="text-sm font-bold text-slate-200">
                    PLANCHA GANADORA ADJUDICADA: <strong className="text-yellow-400 uppercase text-lg tracking-tight font-black">{winnerData.plancha.nombre}</strong> con <strong className="text-white">{winnerData.votes} votos ({((winnerData.votes / (totalVotos || 1)) * 100).toFixed(1)}%)</strong>
                  </p>
                </div>

                {/* Cabinet grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto max-h-[300px] pr-1">
                  {results.map((pos) => {
                    const isVocal = pos.cargo.nombre.toLowerCase().includes('vocal');
                    const maxWinners = isVocal ? 4 : 1;
                    const winnerCands = pos.resultados
                      .filter(r => r.candidato.plancha_id === winnerData.plancha.id)
                      .filter((_, idx) => idx < maxWinners && _.total_votos > 0);

                    if (winnerCands.length === 0) return null;

                    return winnerCands.map((c, index) => (
                      <div 
                        key={c.candidato.id} 
                        className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl text-center space-y-3 flex flex-col justify-between items-center shadow-lg hover:border-yellow-500/20 transition-all animate-fadeIn"
                      >
                        {c.candidato.foto ? (
                          <img 
                            src={obtenerUrlDirectaDrive(c.candidato.foto)} 
                            alt={c.candidato.nombre} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/20 shadow-md bg-white/5" 
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-500/20 flex items-center justify-center text-slate-400 font-black text-xl shadow-md">
                            {c.candidato.nombre.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-0.5 w-full">
                          <h4 className="font-extrabold text-sm text-slate-100 truncate">{c.candidato.nombre}</h4>
                          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest leading-none">
                            {pos.cargo.nombre} {isVocal ? `#${index + 1}` : ''}
                          </p>
                        </div>
                      </div>
                    ));
                  })}
                </div>

              </div>
            ) : (
              <div className="text-center p-12 bg-slate-900/60 border border-white/5 rounded-3xl">
                <p className="text-slate-400 font-bold">No hay datos de escrutinio para proclamar una plancha ganadora en este momento.</p>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 9: CIERRE / PREGUNTAS (WITH NEIFY CRUZ SIGNATURE IN FABULOUS CURSIVE) */}
        {currentSlide === 9 && (
          <div className="text-center space-y-6 max-w-2xl animate-fadeIn">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/10">
                <Award className="w-10 h-10 text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-yellow-400 via-amber-200 to-white bg-clip-text text-transparent leading-none">
                ¡GRACIAS POR SU ATENCIÓN!
              </h2>
              <p className="text-lg text-slate-400 font-medium">
                Sesión abierta para aclaraciones, preguntas y debate del Pleno.
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 max-w-sm mx-auto space-y-3 text-slate-400 text-xs">
              <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Cierre del Acta de Elección</p>
              <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl text-center relative overflow-hidden">
                {/* Dynamically load Great Vibes cursive font */}
                <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
                
                {/* Fabulous handwritten cursive signature */}
                <p className="text-4xl text-yellow-400 font-normal my-2 select-none" style={{ fontFamily: "'Great Vibes', cursive" }}>
                  Neify Cruz
                </p>
                <div className="w-36 border-b border-slate-700 mx-auto mb-2"></div>
                <p className="text-xs font-extrabold text-slate-200">Neify Cruz</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Responsable de Elecciones</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer Controls & Navigation Bar */}
      <footer className="w-full px-6 py-4 flex items-center justify-between border-t border-white/5 bg-slate-900/40 backdrop-blur-md relative z-10">
        
        {/* Left Side: Slide Number Indicator */}
        <div className="flex items-center gap-3">
          <Presentation className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-xs text-slate-400 font-bold">
            Diapositiva <strong className="text-white">{currentSlide + 1}</strong> de <strong className="text-slate-400">{slidesCount}</strong>
          </span>
          <div className="flex gap-1">
            {Array.from({ length: slidesCount }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'w-6 bg-blue-500' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Back/Next arrows */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="border-white/5 bg-white/5 text-slate-300 hover:text-white disabled:opacity-40 rounded-lg p-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slidesCount - 1}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg px-4 flex items-center gap-1.5 shrink-0"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </footer>

    </div>
  );
};
