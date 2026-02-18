import {
  Users as UsersIcon,
  Activity as ActivityIcon,
  BookOpen as BookOpenIcon,
  BarChart3 as BarChart3Icon,
  Calendar as CalendarIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Dumbbell as DumbbellIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle2 as CheckCircle2Icon,
  ArrowRight as ArrowRightIcon,
  Filter as FilterIcon,
  Trophy as TrophyIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
  Clock as ClockIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Zap as ZapIcon,
  ClipboardList as ClipboardListIcon,
  History as HistoryIcon,
  LayoutDashboard as LayoutDashboardIcon,
  AlertTriangle as AlertTriangleIcon,
  ClipboardCheck as ClipboardCheckIcon,
  UserPlus as UserPlusIcon,
  ChevronDown as ChevronDownIcon,
  CalendarDays as CalendarDaysIcon,
  Trash2 as Trash2Icon,
  BarChart as BarChartIcon,
  FileDown as FileDownIcon,
  PanelLeft as PanelLeftIcon,
  PanelLeftClose as PanelLeftCloseIcon,
  List as ListIcon,
  Heart as HeartIcon,
  Video as VideoIcon,
  PlayCircle as PlayCircleIcon,
  BadgeCheck as BadgeCheckIcon,
  Printer as PrinterIcon,
  ZapOff as ZapOffIcon,
  Watch as WatchIcon,
  Gauge as GaugeIcon,
  File as FileIcon,
  Scale as ScaleIcon,
  Beaker as BeakerIcon,
  Table as TableIcon,
  FileEdit as FileEditIcon,
  FileSearch as FileSearchIcon,
  FileStack as FileStackIcon,
  Pencil as PencilIcon,
  Stethoscope as StethoscopeIcon,
  Layers as LayersIcon,
  Download as DownloadIcon,
  Monitor as MonitorIcon,
  Settings as SettingsIcon,
  Eye as EyeIcon,
  Moon as MoonIcon,
  Smile as SmileIcon,
  Flame as FlameIcon
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Exercise, Player, Team, DailyTelemetry, ScheduledSession, LoadLevel, PlanBlock, BlockType, WorkoutOptions } from './types';

// ACWR Utility Functions
const calculateEWMA = (loads: number[], days: number): number => {
  if (loads.length === 0) return 0;
  const lambda = 2 / (days + 1);
  let ewma = loads[0];
  for (let i = 1; i < loads.length; i++) {
    ewma = (loads[i] * lambda) + (ewma * (1 - lambda));
  }
  return ewma;
};

const calculateACWR = (acuteLoad: number, chronicLoad: number): number => {
  if (chronicLoad === 0) return 0;
  return acuteLoad / chronicLoad;
};

const getACWRStatus = (acwr: number): { status: string, color: string, bgColor: string, risk: string } => {
  if (acwr < 0.8) return { status: 'Detraining', color: 'text-blue-600', bgColor: 'bg-blue-100', risk: 'Loss of fitness' };
  if (acwr >= 0.8 && acwr <= 1.3) return { status: 'Optimal', color: 'text-emerald-600', bgColor: 'bg-emerald-100', risk: 'Sweet spot' };
  if (acwr > 1.3 && acwr <= 1.5) return { status: 'Caution', color: 'text-amber-600', bgColor: 'bg-amber-100', risk: 'Increasing risk' };
  return { status: 'Danger', color: 'text-rose-600', bgColor: 'bg-rose-100', risk: 'High injury risk' };
};

const DEFAULT_OPTIONS: WorkoutOptions = {
  completionOnly: false,
  barSpeed: false,
  bodyWeight: false,
  peakPower: false,
  coachComp: false,
  trackRepCount: true,
  eachSide: false,
  trackVolumeLoad: true
};

const MOCK_EXERCISES: Exercise[] = [
  { id: 's1', name: 'Barbell Back Squat', description: 'Ensure spine is neutral. Descend until thighs are parallel to floor. Drive through mid-foot.', equipment: ['Barbell', 'Rack'], bodyParts: ['Quads', 'Glutes'], categories: ['Strength', 'Lower Body'], trackingType: '1RM', tags: ['Lower Body Push Bilateral'], options: DEFAULT_OPTIONS, videoUrl: 'https://www.youtube.com/watch?v=u1l6bQ_owQY' },
  { id: 's2', name: 'Barbell Bench Press', description: 'Retract scapula. Maintain 3 points of contact. Lower bar to mid-sternum.', equipment: ['Barbell', 'Bench'], bodyParts: ['Chest', 'Triceps'], categories: ['Strength', 'Upper Body'], trackingType: '1RM', tags: ['Horizontal Push Bilateral'], options: DEFAULT_OPTIONS, videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3ps' },
  { id: 's3', name: 'Barbell Curl', description: 'Full extension at bottom. Squeeze biceps at peak. Avoid using momentum.', equipment: ['Barbell'], bodyParts: ['Biceps'], categories: ['Strength', 'Upper Body'], trackingType: 'Highest Weight', tags: ['Isolation-Bicep'], options: DEFAULT_OPTIONS },
];

// --- ENHANCED MOCK DATA FOR ACWR TESTING ---
// Generate telemetry with specific ACWR scenarios
const generateOptimalTelemetry = (days: number): DailyTelemetry[] => {
  // Optimal ACWR: consistent moderate load (ACWR ~1.0-1.2)
  const telemetry: DailyTelemetry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const baseRPE = 6;
    const variation = Math.sin(i / 7) * 1.5; // Weekly undulation
    telemetry.push({
      date: dateStr,
      kms: Number((Math.random() * 2 + 4).toFixed(1)),
      rpe: Math.max(4, Math.min(8, Math.round(baseRPE + variation))),
      wellness: {
        sleep: Math.floor(Math.random() * 2) + 7,
        stress: Math.floor(Math.random() * 3) + 2,
        soreness: Math.floor(Math.random() * 4) + 2,
        mood: Math.floor(Math.random() * 2) + 7,
        readinessScore: Math.floor(Math.random() * 15) + 75
      }
    });
  }
  return telemetry;
};

const generateOvertrainingTelemetry = (days: number): DailyTelemetry[] => {
  // Danger ACWR: recent spike in load (ACWR > 1.5)
  const telemetry: DailyTelemetry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Low chronic load, then sudden spike in last 7 days
    const rpe = i < 7 ? Math.floor(Math.random() * 2) + 8 : Math.floor(Math.random() * 2) + 4;
    telemetry.push({
      date: dateStr,
      kms: Number((Math.random() * 3 + (i < 7 ? 6 : 3)).toFixed(1)),
      rpe,
      wellness: {
        sleep: Math.floor(Math.random() * 2) + (i < 7 ? 5 : 7),
        stress: Math.floor(Math.random() * 2) + (i < 7 ? 6 : 3),
        soreness: Math.floor(Math.random() * 2) + (i < 7 ? 6 : 3),
        mood: Math.floor(Math.random() * 2) + (i < 7 ? 5 : 7),
        readinessScore: Math.floor(Math.random() * 20) + (i < 7 ? 50 : 70)
      }
    });
  }
  return telemetry;
};

const generateDetrainingTelemetry = (days: number): DailyTelemetry[] => {
  // Low ACWR: recent decrease in load (ACWR < 0.8)
  const telemetry: DailyTelemetry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // High chronic load, then drop in last 7 days
    const rpe = i < 7 ? Math.floor(Math.random() * 2) + 3 : Math.floor(Math.random() * 2) + 7;
    telemetry.push({
      date: dateStr,
      kms: Number((Math.random() * 2 + (i < 7 ? 2 : 5)).toFixed(1)),
      rpe,
      wellness: {
        sleep: Math.floor(Math.random() * 2) + 7,
        stress: Math.floor(Math.random() * 2) + 2,
        soreness: Math.floor(Math.random() * 2) + 2,
        mood: Math.floor(Math.random() * 2) + 7,
        readinessScore: Math.floor(Math.random() * 15) + 75
      }
    });
  }
  return telemetry;
};

const generateRecoveryTelemetry = (days: number): DailyTelemetry[] => {
  // Caution ACWR: moderate increase (ACWR ~1.3-1.4)
  const telemetry: DailyTelemetry[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rpe = i < 7 ? Math.floor(Math.random() * 2) + 7 : Math.floor(Math.random() * 2) + 5;
    telemetry.push({
      date: dateStr,
      kms: Number((Math.random() * 2 + 4).toFixed(1)),
      rpe,
      wellness: {
        sleep: Math.floor(Math.random() * 2) + 6,
        stress: Math.floor(Math.random() * 3) + 3,
        soreness: Math.floor(Math.random() * 3) + 4,
        mood: Math.floor(Math.random() * 2) + 6,
        readinessScore: Math.floor(Math.random() * 20) + 65
      }
    });
  }
  return telemetry;
};

const MOCK_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'First Team Squad',
    sport: 'Soccer',
    status: 'Active',
    description: 'Premier Division senior roster focusing on tactical periodization.',
    players: [
      {
        id: 'p1',
        name: 'Teofe Ziemnicki',
        subsection: 'Athletes',
        gender: 'Male',
        age: 28,
        oneRM: { 's1': 160, 's2': 105, 's3': 45 },
        telemetry: generateOptimalTelemetry(45),
        performanceHistory: [
          { date: '2024-12-22', metric: 'topSpeed', value: 33.5 },
          { date: '2024-12-15', metric: 'Back Squat 1RM', value: 160 },
          { date: '2025-01-20', metric: 'Bench Press 1RM', value: 105 }
        ],
        adherence: 95
      },
      {
        id: 'p2',
        name: 'Marcus Henderson',
        subsection: 'Athletes',
        gender: 'Male',
        age: 24,
        oneRM: { 's1': 185, 's2': 110 },
        telemetry: generateOvertrainingTelemetry(45),
        performanceHistory: [
          { date: '2024-12-22', metric: 'topSpeed', value: 34.2 },
          { date: '2025-01-10', metric: 'Back Squat 1RM', value: 185 }
        ],
        adherence: 90
      },
      {
        id: 'p3',
        name: 'Sarah Chen',
        subsection: 'Athletes',
        gender: 'Female',
        age: 26,
        oneRM: { 's1': 120, 's2': 65 },
        telemetry: generateDetrainingTelemetry(45),
        performanceHistory: [
          { date: '2024-12-18', metric: 'Back Squat 1RM', value: 120 },
          { date: '2025-01-15', metric: 'Bench Press 1RM', value: 65 }
        ],
        adherence: 85
      },
      {
        id: 'p4',
        name: 'James Rodriguez',
        subsection: 'Athletes',
        gender: 'Male',
        age: 22,
        oneRM: { 's1': 175, 's2': 95 },
        telemetry: generateRecoveryTelemetry(45),
        performanceHistory: [
          { date: '2024-12-20', metric: 'topSpeed', value: 35.1 },
          { date: '2025-01-12', metric: 'Back Squat 1RM', value: 175 }
        ],
        adherence: 92
      }
    ]
  }
];

const BLOCK_COLORS: Record<BlockType, string> = {
  'Low Intensity': 'bg-emerald-100 border-emerald-200 text-emerald-800',
  'Medium Intensity': 'bg-amber-100 border-amber-200 text-amber-800',
  'Maximal Load': 'bg-red-100 border-red-200 text-red-800',
  'Anthropometrics': 'bg-purple-100 border-purple-200 text-purple-800',
  'General': 'bg-blue-100 border-blue-200 text-blue-800',
  'Recovery': 'bg-cyan-100 border-cyan-200 text-cyan-800'
};

const MOCK_INDIVIDUAL_PLAN_BLOCKS: PlanBlock[] = [
  { id: 'ib1', title: 'General Preparation', startDate: '2024-12-22', endDate: '2025-01-11', color: BLOCK_COLORS['General'], row: 0, blockType: 'General', notes: 'Establishing baseline movement patterns and work capacity.' },
  { id: 'ib2', title: 'Strength Phase 1', startDate: '2025-01-12', endDate: '2025-02-08', color: BLOCK_COLORS['Medium Intensity'], row: 0, blockType: 'Medium Intensity', notes: 'Focus on volume accumulation at 70-80% 1RM.' },
  { id: 'ib3', title: 'Strength Phase 2', startDate: '2025-02-09', endDate: '2025-03-01', color: BLOCK_COLORS['Maximal Load'], row: 0, blockType: 'Maximal Load', notes: 'High intensity peak. 85%+ loading.' },
];

const MOCK_SESSIONS: ScheduledSession[] = [
  { id: 's_01', date: '2025-01-15', targetId: 't1', targetType: 'Team', load: 'High', trainingPhase: 'General Preparation', title: 'Tactical Speed', notes: 'Focus on accelerations.', exerciseIds: ['s1'], plannedDuration: 75, status: 'Completed', actualRPE: 7 },
  { id: 's_02', date: '2025-01-16', targetId: 'p1', targetType: 'Individual', load: 'Maximal', trainingPhase: 'Specific Preparation', title: 'Strength B', notes: 'Squat focus.', exerciseIds: ['s1', 's2'], plannedDuration: 60, status: 'Completed', actualRPE: 9 },
  { id: 's_03', date: '2025-01-18', targetId: 't1', targetType: 'Team', load: 'Low', trainingPhase: 'Active Recovery', title: 'Recovery Pool', notes: 'Low impact.', exerciseIds: [], plannedDuration: 45, status: 'Completed', actualRPE: 3 },
  { id: 's_04', date: '2025-01-20', targetId: 't1', targetType: 'Team', load: 'Medium', trainingPhase: 'General Preparation', title: 'Technical Build', notes: 'Positioning.', exerciseIds: ['s1'], plannedDuration: 70, status: 'Scheduled' },
];

type Tab = 'dashboard' | 'periodization' | 'clients' | 'library' | 'analytics' | 'reports' | 'conditioning';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_EXERCISES);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(MOCK_SESSIONS);
  const [planBlocks, setPlanBlocks] = useState<PlanBlock[]>(MOCK_INDIVIDUAL_PLAN_BLOCKS);

  const [isEditLiftModalOpen, setIsEditLiftModalOpen] = useState(false);
  const [isPlanBlockModalOpen, setIsPlanBlockModalOpen] = useState(false);
  const [selectedPlanBlock, setSelectedPlanBlock] = useState<PlanBlock | null>(null);
  const [planBlockTab, setPlanBlockTab] = useState<'info' | 'edit'>('info');

  const [isDashboardCalendarOpen, setIsDashboardCalendarOpen] = useState(false);
  const [isWeightroomSheetModalOpen, setIsWeightroomSheetModalOpen] = useState(false);
  const [wsMode, setWsMode] = useState<'blank' | 'advanced'>('blank');
  const [wrSelectedTeam, setWrSelectedTeam] = useState('All');
  const [wsColumns, setWsColumns] = useState<Array<{ id: string, label: string, type: string, exerciseId: string, metric: string }>>([]);

  const [isWorkoutPacketModalOpen, setIsWorkoutPacketModalOpen] = useState(false);

  const [activeAnalyticsModule, setActiveAnalyticsModule] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [activeConditioningModule, setActiveConditioningModule] = useState<string | null>(null);

  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('all');
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [viewingSession, setViewingSession] = useState<ScheduledSession | null>(null);
  const [acwrDetailAthlete, setAcwrDetailAthlete] = useState<Player | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [planningLevel, setPlanningLevel] = useState<'Team' | 'Individual'>('Individual');

  const athletes = useMemo(() => teams.flatMap(t => t.players), [teams]);
  const selectedAthlete = useMemo(() => athletes.find(a => a.id === selectedAthleteId), [athletes, selectedAthleteId]);

  // Calculate ACWR for all athletes
  const athletesACWR = useMemo(() => {
    return athletes.map(athlete => {
      const loads = athlete.telemetry.map(t => t.rpe * 60);
      const acuteLoad = calculateEWMA(loads, 7);
      const chronicLoad = calculateEWMA(loads, 28);
      const acwr = calculateACWR(acuteLoad, chronicLoad);
      const status = getACWRStatus(acwr);
      return { athlete, acwr, acuteLoad, chronicLoad, status };
    });
  }, [athletes]);

  // Get urgent ACWR alerts (Caution or Danger)
  const acwrAlerts = useMemo(() => {
    return athletesACWR.filter(a => a.status.status === 'Caution' || a.status.status === 'Danger');
  }, [athletesACWR]);

  const filteredTelemetry = useMemo(() => {
    if (selectedAthleteId === 'all') {
      const map: Record<string, { totalRpe: number, count: number }> = {};
      athletes.forEach(a => {
        a.telemetry.forEach(t => {
          if (!map[t.date]) map[t.date] = { totalRpe: 0, count: 0 };
          map[t.date].totalRpe += t.rpe;
          map[t.date].count += 1;
        });
      });
      return Object.entries(map).map(([date, val]) => ({
        date,
        rpe: Number((val.totalRpe / val.count).toFixed(1)),
        kms: 0
      })).sort((a, b) => a.date.localeCompare(b.date));
    }
    return selectedAthlete?.telemetry || [];
  }, [selectedAthleteId, selectedAthlete, athletes]);

  const getLoadColor = (load: LoadLevel) => {
    switch (load) {
      case 'Maximal': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-400 text-white';
      case 'Medium': return 'bg-amber-400 text-white';
      case 'Low': return 'bg-emerald-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const handleOpenPlayerProfile = (name: string) => {
    const player = teams.flatMap(t => t.players).find(p =>
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase())
    );
    if (player) {
      setViewingPlayer(player);
    }
  };

  const timelineWeeks = useMemo(() => {
    const arr = [];
    let start = new Date(2024, 11, 22);
    for (let i = 0; i < 12; i++) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      arr.push({ label: `W${i}`, range: `${start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`, startDate: new Date(start) });
      start = new Date(end); start.setDate(start.getDate() + 1);
    }
    return arr;
  }, []);

  const dashboardCalendarDays = useMemo(() => {
    const arr = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDay = start.getDay();
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let i = 1; i <= end.getDate(); i++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      arr.push({ day: i, dateStr });
    }
    return arr;
  }, []);

  // RESTORED: Table-based Exercise Library with RED/BLUE action buttons and DELETE button
  const renderExerciseLibrary = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm border-t-8 border-t-slate-900">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Exercise Library</h2>
          <div className="h-10 w-px bg-slate-100 mx-2"></div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Managing: <span className="text-cyan-600">Lifts</span> <ChevronDownIcon size={14} /></div>
        </div>
        <div className="flex items-center gap-4">
          {/* RED AND BLUE ACTION BUTTONS */}
          <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:bg-blue-700">
            <VideoIcon size={16} /> Movement Patterns
          </button>
          <button className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:bg-red-700">
            <SettingsIcon size={16} /> Manage Categories
          </button>

          <div className="relative group">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input type="text" placeholder="Search database..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/20 w-80 shadow-inner" />
          </div>
          <button onClick={() => { setEditingExercise(null); setIsEditLiftModalOpen(true); }} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:bg-black">
            <PlusIcon size={16} /> Add Exercise
          </button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 w-12"><input type="checkbox" className="rounded-md border-slate-300 text-cyan-600 h-4 w-4" /></th>
              <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lift Name</th>
              <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking</th>
              <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {exercises.filter(ex => ex.name.toLowerCase().includes(librarySearch.toLowerCase())).map(ex => (
              <tr key={ex.id} className="group hover:bg-slate-50 transition-colors">
                <td className="p-6"><input type="checkbox" className="rounded-md border-slate-300 text-cyan-600 h-4 w-4" /></td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors">{ex.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{ex.description}</span>
                  </div>
                </td>
                <td className="p-6"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-tighter border border-slate-200">{ex.trackingType}</span></td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingExercise(ex); setIsEditLiftModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black transition-all active:scale-90"><PencilIcon size={16} /></button>
                    {/* RESTORED: Delete button */}
                    <button className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90">
                      <Trash2Icon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // RESTORED: Reporting Hub with 12 modules
  const renderReportingHub = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group/header border-t-8 border-t-slate-900">
        <div className="space-y-4 relative z-10">
          <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Reporting</h2>
          <p className="text-rose-600 text-sm font-bold uppercase tracking-wide">Athletes not in groups will not be visible in reporting.</p>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">*All reporting terminals are optimized for high-density strategic review.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-80 shrink-0 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tighter border-b border-slate-100 pb-4 flex items-center gap-3"><FilterIcon size={20} className="text-slate-400" /> Filter</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select By Athlete</label>
                <div className="relative group">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none appearance-none"
                  >
                    <option value="all">Full Squad (Average)</option>
                    {teams.flatMap(t => t.players).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDownIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="Search..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Activity', desc: 'Summary of activity over the past 7 days', icon: ClipboardListIcon },
            { title: 'Completion Report', desc: 'Completion percentages over time', icon: CheckCircle2Icon },
            { title: 'Workout Results', desc: 'Detailed result lists for selected periods', icon: ListIcon },
            { title: 'Progress Report', desc: 'Longitudinal progress for specific exercises', icon: TrendingUpIcon },
            { title: 'Max', desc: 'Benchmark tracking for selected protocols', icon: TrophyIcon },
            { title: 'Questionnaire', desc: 'Fatigue states based on diagnostic survey data', icon: BeakerIcon },
            { title: 'Evaluation Report', desc: 'Compare evaluation periods for changes', icon: FileEditIcon },
            { title: 'Comparison Report', desc: 'Compare max results over specified windows', icon: ScaleIcon },
            { title: 'Opt Out/Notes Report', desc: 'Medical opt-outs and coach strategic notes', icon: AlertTriangleIcon },
            { title: 'Rep & Load Report', desc: 'Total tonnage and volume load analysis', icon: GaugeIcon },
            { title: 'Assessment Report', desc: 'Identify strengths/weaknesses via tag mapping', icon: SearchIcon },
            { title: 'Raw Data', desc: 'Download training data as normalized CSV', icon: TableIcon }
          ].map((report, i) => (
            <button key={i} onClick={() => setActiveReport(report.title)} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col text-left relative overflow-hidden h-fit min-h-[160px]">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                  <report.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{report.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{report.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // --- CONDITIONING HUB ---
  const renderConditioningHub = () => {
    return (
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group/header border-t-8 border-t-slate-900">
          <div className="space-y-4 relative z-10">
            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Conditioning Hub</h2>
            <p className="text-slate-400 text-lg italic leading-relaxed font-medium">Performance conditioning monitoring & Wattbike protocols.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { t: 'Wattbike Hub', i: GaugeIcon, c: 'wattbike', d: 'High-fidelity Wattbike power profiling and protocol management.' },
            { t: 'Running Mechanics', i: ActivityIcon, c: 'running', d: 'Gait analysis and horizontal force-velocity profiling.' },
            { t: 'Metabolic Profiles', i: BeakerIcon, c: 'metabolic', d: 'Lactate threshold tracking and physiological stress monitoring.' },
          ].map(mod => (
            <div key={mod.c} onClick={() => setActiveConditioningModule(mod.c)} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all overflow-hidden cursor-pointer group p-8 space-y-4 h-fit">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all"><mod.i size={24} /></div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{mod.t}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.d}</p>
            </div>
          ))}
        </div>

        {activeConditioningModule === 'wattbike' && (
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center border-b border-slate-50 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl">
                  <GaugeIcon size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Wattbike Hub Terminal</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">High-Fidelity Power Profiling // Serial: WB-402-TX</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  System Online
                </div>
                <button
                  onClick={() => setActiveConditioningModule(null)}
                  className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all"
                >
                  Close Terminal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* LIVE TELEMETRY GRID */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Current Power', val: '284', unit: 'W', sub: 'Avg: 245W', color: 'text-cyan-600' },
                    { label: 'Cadence', val: '92', unit: 'RPM', sub: 'Target: 90-95', color: 'text-slate-900' },
                    { label: 'Efficiency', val: '52/48', unit: '%', sub: 'L/R Balance', color: 'text-indigo-600' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">{stat.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black ${stat.color}`}>{stat.val}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase">{stat.unit}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block pt-2 border-t border-slate-200/50">{stat.sub}</span>
                    </div>
                  ))}
                </div>

                {/* POWER CURVE PREVIEW (SVG) */}
                <div className="bg-slate-900 p-10 rounded-[2.5rem] h-64 relative overflow-hidden flex flex-col justify-between shadow-2xl">
                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Live Force Profile // Polar View</span>
                    <div className="flex gap-2 text-[9px] font-black uppercase">
                      <span className="text-cyan-400">Current</span>
                      <span className="text-white/20">Benchmark</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg viewBox="0 0 100 100" className="w-40 h-40">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
                      <path d="M50,10 Q80,20 90,50 Q80,80 50,90 Q20,80 10,50 Q20,20 50,10" fill="none" stroke="cyan" strokeWidth="2" className="animate-pulse" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-end z-10 text-[9px] font-black uppercase text-white/40">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                  </div>
                </div>
              </div>

              {/* PROTOCOL SELECTOR */}
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 space-y-8">
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Active Protocol</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Select automated resistance profile</p>
                </div>
                <div className="space-y-4">
                  {[
                    { t: '6min TT Baseline', s: 'Stamina Build', active: true },
                    { t: 'Peak Power 6s', s: 'Neuromuscular', active: false },
                    { t: 'VO2 Max Intervals', s: 'Metabolic stress', active: false },
                    { t: 'Recovery Spin', s: 'Active Restoration', active: false }
                  ].map((p, i) => (
                    <button key={i} className={`w-full p-5 rounded-2xl flex flex-col text-left transition-all ${p.active ? 'bg-slate-900 text-white shadow-xl scale-[1.05]' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'}`}>
                      <span className="text-xs font-black uppercase">{p.t}</span>
                      <span className={`text-[9px] font-bold uppercase mt-1 ${p.active ? 'text-cyan-400' : 'text-slate-400'}`}>{p.s}</span>
                    </button>
                  ))}
                </div>
                <button className="w-full py-5 bg-cyan-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all">Start Session</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsHub = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
      {!activeAnalyticsModule ? (
        <>
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group/header border-t-8 border-t-slate-900">
            <div className="space-y-4 relative z-10">
              <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Analytics Hub</h2>
              <p className="text-slate-400 text-lg italic leading-relaxed font-medium">Diagnostic monitoring terminals for elite high-performance units.</p>
            </div>
          </div>

          {acwrAlerts.length > 0 && (
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 p-8 rounded-[2.5rem] border-2 border-rose-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                    <AlertTriangleIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">ACWR Alerts</h3>
                    <p className="text-xs text-slate-600 font-medium">{acwrAlerts.length} athlete{acwrAlerts.length > 1 ? 's' : ''} require attention</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAnalyticsModule('acwr')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase hover:bg-black transition-all"
                >
                  View All Athletes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acwrAlerts.map(({ athlete, acwr, status }) => (
                  <button
                    key={athlete.id}
                    onClick={() => setAcwrDetailAthlete(athlete)}
                    className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-900 hover:shadow-xl transition-all text-left group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-slate-900">{athlete.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{athlete.subsection}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900">{acwr.toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">ACWR</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${status.bgColor} border-2 ${status.color.replace('text-', 'border-')}`}>
                          <span className={`text-xs font-black uppercase ${status.color}`}>{status.status}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { t: 'ACWR Monitor', i: ZapIcon, c: 'acwr', d: 'Acute:Chronic Workload Ratio tracking for injury risk assessment across all athletes.' },
              { t: 'Biometrics', i: WatchIcon, c: 'biometrics', d: 'Session-based heart rate zones, peaks, and metabolic stress tracking.' },
              { t: 'Load Monitoring', i: ActivityIcon, c: 'load', d: 'Analyze delta between Planned Prescribed Load and Perceived Effort.' },
              { t: 'KPI Tracker', i: ClipboardListIcon, c: 'kpi', d: 'Performance benchmark monitoring for internal research.' },
              { t: 'Body Heatmap', i: StethoscopeIcon, c: 'heatmap', d: 'Visual body map of athlete-reported pain and soreness hot spots.' },
              { t: 'Habit Tracker', i: CheckCircle2Icon, c: 'habit', d: 'Monitor adherence to hydration, sleep, and nutrition protocols.' },
              { t: 'Volume Tracker', i: LayersIcon, c: 'volume', d: 'High-fidelity tonnage analysis for specific movement patterns.' }
            ].map(mod => (
              <div key={mod.c} onClick={() => setActiveAnalyticsModule(mod.c)} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all overflow-hidden cursor-pointer group p-8 space-y-4 h-fit">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all"><mod.i size={24} /></div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{mod.t}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.d}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between">
            <button onClick={() => setActiveAnalyticsModule(null)} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"><ArrowLeftIcon size={16} /> Back to Hub</button>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Focus:</span>
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">{selectedAthleteId === 'all' ? 'Team Average' : selectedAthlete?.name}</span>
            </div>
          </div>

          {activeAnalyticsModule === 'acwr' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 min-h-[500px] space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">ACWR Monitor</h3>
                  <p className="text-sm text-slate-400 font-medium">Acute:Chronic Workload Ratio - Injury Risk Assessment</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold uppercase text-slate-400">Optimal</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold uppercase text-slate-400">Caution</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold uppercase text-slate-400">Danger</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold uppercase text-slate-400">Detraining</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {athletesACWR.map(({ athlete, acwr, acuteLoad, chronicLoad, status }) => (
                  <button
                    key={athlete.id}
                    onClick={() => setAcwrDetailAthlete(athlete)}
                    className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-900 hover:shadow-xl transition-all text-left group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-slate-900">{athlete.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{athlete.subsection}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl ${status.bgColor} border-2 ${status.color.replace('text-', 'border-')}`}>
                        <span className={`text-xs font-black uppercase ${status.color}`}>{status.status}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-slate-900">{acwr.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ACWR</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Acute (7d)</span>
                          <span className="text-sm font-black text-slate-900">{acuteLoad.toFixed(0)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Chronic (28d)</span>
                          <span className="text-sm font-black text-slate-900">{chronicLoad.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeAnalyticsModule === 'load' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 min-h-[500px] flex flex-col space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Load Monitoring & ACWR</h3>
                  <p className="text-sm text-slate-400 font-medium">Acute:Chronic Workload Ratio for injury risk assessment</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <ActivityIcon size={40} className="text-slate-300 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Load Monitoring Terminal Awaiting Data</p>
                </div>
              </div>
            </div>
          )}

          {activeAnalyticsModule === 'heatmap' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 min-h-[500px] space-y-10 flex flex-col items-center">
              <div className="flex justify-between items-start w-full">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Body Heatmap</h3>
                  <p className="text-sm text-slate-400 font-medium">Athlete-reported pain and soreness hot spots.</p>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center gap-20">
                {/* Front View */}
                <div className="relative h-[300px] w-[120px]">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-slate-300 tracking-widest">Anterior</span>
                  <svg viewBox="0 0 100 250" className="w-full h-full drop-shadow-xl filter">
                    <path d="M50,20 C65,20 70,30 70,45 L85,50 L95,45 L95,110 L85,115 L70,80 L70,120 L80,180 L80,240 L60,240 L60,160 L50,150 L40,160 L40,240 L20,240 L20,180 L30,120 L30,80 L15,115 L5,110 L5,45 L15,50 L30,45 C30,30 35,20 50,20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    {/* Hotspots */}
                    <circle cx="30" cy="90" r="5" className="fill-rose-500 animate-pulse" />
                    <circle cx="70" cy="130" r="5" className="fill-amber-400" />
                  </svg>
                </div>
                {/* Back View */}
                <div className="relative h-[300px] w-[120px]">
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-slate-300 tracking-widest">Posterior</span>
                  <svg viewBox="0 0 100 250" className="w-full h-full drop-shadow-xl filter">
                    <path d="M50,20 C65,20 70,30 70,45 L85,50 L95,45 L95,110 L85,115 L70,80 L70,120 L80,180 L80,240 L60,240 L60,160 L50,150 L40,160 L40,240 L20,240 L20,180 L30,120 L30,80 L15,115 L5,110 L5,45 L15,50 L30,45 C30,30 35,20 50,20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    {/* Hotspots */}
                    <circle cx="50" cy="70" r="8" className="fill-amber-400/50" />
                    <circle cx="30" cy="190" r="4" className="fill-rose-500" />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600"><AlertTriangleIcon size={20} /></div>
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase text-slate-900 block">Right Hamstring (Distal)</span>
                    <span className="text-[10px] font-bold text-slate-400">Reported 2h ago via Mobile App · Pain Scale 4/10</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all">View History</button>
              </div>
            </div>
          )}

          {activeAnalyticsModule === 'volume' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 min-h-[500px] space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Volume Tracker</h3>
                  <p className="text-sm text-slate-400 font-medium">Tonnage accumulation by movement pattern.</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none">
                  <option>Squat Pattern</option>
                  <option>Hinge Pattern</option>
                  <option>Push Pattern</option>
                  <option>Pull Pattern</option>
                </select>
              </div>

              <div className="flex-1 flex items-end gap-3 h-64 border-b border-slate-100 pb-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const h = Math.random() * 80 + 20;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600 relative" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{(h * 100).toFixed(0)} kg</div>
                      </div>
                      <span className="text-[8px] font-black text-slate-300">W{i + 1}</span>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Total Tonnage</span>
                  <span className="text-2xl font-black text-slate-900">124.5k</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Avg Intensity</span>
                  <span className="text-2xl font-black text-slate-900">82%</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Frequency</span>
                  <span className="text-2xl font-black text-slate-900">2.4/wk</span>
                </div>
              </div>
            </div>
          )}

          {activeAnalyticsModule !== 'acwr' && activeAnalyticsModule !== 'heatmap' && activeAnalyticsModule !== 'volume' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 h-[400px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center text-slate-300"><MonitorIcon size={32} /></div>
                <h3 className="text-2xl font-black text-slate-300 uppercase">{activeAnalyticsModule} Terminal Offline</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting local hardware integration</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // RESTORED: Professional Multi-track Planner Timeline
  const renderTimeline = () => (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
      <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="w-48 p-6 border-r border-slate-100 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Macro/Micro</span>
        </div>
        <div className="flex-1 flex overflow-x-auto no-scrollbar scroll-smooth">
          {timelineWeeks.map((w, i) => (
            <div key={i} className="min-w-[180px] border-r border-slate-100 p-6 flex flex-col items-center justify-center group hover:bg-white transition-colors">
              <span className="text-sm font-black text-slate-900">{w.label}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{w.range}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50/20">
        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-48 border-r border-slate-100 bg-slate-50/50 sticky left-0 z-20" />
          <div className="flex-1 flex">
            {timelineWeeks.map((_, i) => (
              <div key={i} className="min-w-[180px] border-r border-slate-100/50 h-full" />
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="relative z-10 py-12 space-y-10">
          {/* TRACK 1: Mesocycles */}
          <div className="flex items-center group/row">
            <div className="w-48 px-8 flex flex-col items-start justify-center shrink-0 sticky left-0 bg-slate-50/90 backdrop-blur-sm z-30 h-20 border-r border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Mesocycles</span>
              <button className="text-[8px] font-bold text-cyan-600 uppercase mt-1 flex items-center gap-1 hover:text-cyan-700">
                <PlusIcon size={8} /> Create Block
              </button>
            </div>
            <div className="flex-1 flex relative h-20">
              {planBlocks.map(block => {
                const start = new Date(block.startDate);
                const end = new Date(block.endDate);
                const timelineStart = timelineWeeks[0].startDate;
                const diffDaysStart = Math.floor((start.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24));
                const diffDaysEnd = Math.floor((end.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24));
                const left = (diffDaysStart / 7) * 180;
                const width = ((diffDaysEnd - diffDaysStart + 1) / 7) * 180;
                return (
                  <div key={block.id}
                    onClick={() => { setSelectedPlanBlock(block); setPlanBlockTab('info'); setIsPlanBlockModalOpen(true); }}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    className={`absolute top-0 h-full ${block.color} border-2 rounded-2xl p-5 flex flex-col justify-center cursor-pointer hover:shadow-2xl hover:scale-[1.01] z-10 transition-all overflow-hidden shadow-sm group/block`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase truncate leading-none">{block.title}</span>
                      <SettingsIcon size={12} className="opacity-0 group-hover/block:opacity-100 transition-opacity text-slate-500" />
                    </div>
                    <span className="text-[8px] font-bold opacity-50 uppercase mt-1.5 tracking-widest">{block.blockType}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100/50 mx-10 ml-52" />

          {/* TRACK 2: Testing Gates */}
          <div className="flex items-center group/row">
            <div className="w-48 px-8 flex flex-col items-start justify-center shrink-0 sticky left-0 bg-slate-50/90 backdrop-blur-sm z-30 h-16 border-r border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Testing Gates</span>
            </div>
            <div className="flex-1 flex relative h-16">
              <div className="absolute top-0 h-full w-[180px] left-0 border-r-4 border-r-cyan-500/20 bg-cyan-50/30 flex items-center justify-center">
                <span className="text-[9px] font-black text-cyan-600 uppercase">Baseline Testing</span>
              </div>
              <div className="absolute top-0 h-full w-[180px] left-[1080px] border-r-4 border-r-emerald-500/20 bg-emerald-50/30 flex items-center justify-center">
                <span className="text-[9px] font-black text-emerald-600 uppercase">Outcome Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
      <nav className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-slate-200 flex flex-col shrink-0 z-30 transition-all duration-300 shadow-sm`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-50 min-h-[100px]"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-xl shrink-0"><ActivityIcon className="text-white w-7 h-7" /></div>{!isSidebarCollapsed && <div className="flex flex-col"><span className="font-extrabold text-2xl tracking-tighter leading-none">trainer<span className="text-cyan-600">OS</span></span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">S&C Terminal</span></div>}</div></div>
        <div className="flex-1 px-5 space-y-3 pt-10 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
            { id: 'periodization', label: 'Planner', icon: CalendarIcon },
            { id: 'clients', label: 'Roster', icon: UsersIcon },
            { id: 'library', label: 'Exercise Library', icon: BookOpenIcon },
            { id: 'conditioning', label: 'Conditioning Hub', icon: ZapIcon },
            { id: 'analytics', label: 'Analytics Hub', icon: BarChart3Icon },
            { id: 'reports', label: 'Reporting Hub', icon: FileIcon }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as Tab); setActiveAnalyticsModule(null); setActiveReport(null); }} className={`w-full flex items-center gap-5 px-5 py-4 rounded-[1.25rem] transition-all ${activeTab === item.id ? 'bg-slate-900 text-white font-bold shadow-2xl scale-[1.02]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}><item.icon size={22} />{!isSidebarCollapsed && <span className="text-[14px] uppercase tracking-wider font-bold">{item.label}</span>}</button>
          ))}
        </div>
        <div className="p-5 border-t border-slate-100"><button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center py-4 rounded-[1.25rem] text-slate-400 hover:bg-slate-50 transition-all">{isSidebarCollapsed ? <PanelLeftIcon size={22} /> : <PanelLeftCloseIcon size={22} />}</button></div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 border-b border-slate-200 flex items-center justify-between px-10 bg-white shrink-0 z-10"><h2 className="text-[12px] font-bold uppercase tracking-[0.5em] text-slate-400">Environment // {activeTab}</h2><div className="flex items-center gap-5"><div className="flex items-center gap-3 text-[12px] font-bold uppercase text-slate-500 bg-slate-50 px-6 py-3 rounded-full border border-slate-100"><ClockIcon size={16} className="text-cyan-600" /> Jan 2025</div></div></header>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/40 no-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { l: 'Readiness Index', v: '84%', i: HeartIcon },
                  { l: 'Squad RPE Avg', v: '7.2', i: ActivityIcon },
                  { l: 'Compliance', v: '94%', i: ClipboardCheckIcon },
                  { l: 'Active Subjects', v: teams[0].players.length.toString(), i: UsersIcon }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all"><s.i size={28} /></div>
                    <div>
                      <div className="text-3xl font-black text-slate-900">{s.v}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 h-fit">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-6"><h3 className="text-xl font-black uppercase tracking-tighter">Live Activity</h3><HistoryIcon size={20} className="text-slate-300" /></div>
                  <div className="space-y-6">
                    {[
                      { name: 'Teofe Z', session: 'Leg Hypertrophy', rpe: 8, time: '12m ago', status: 'Completed' },
                      { name: 'Marcus H', session: 'Speed Activation', rpe: 6, time: '45m ago', status: 'Modified' },
                      { name: 'Jon D', session: 'Upper Body B', rpe: 9, time: '1h ago', status: 'Completed' },
                    ].map((act, i) => (
                      <button key={i} onClick={() => handleOpenPlayerProfile(act.name)} className="w-full flex gap-4 group cursor-pointer text-left hover:bg-slate-50 p-2 rounded-2xl transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors font-black text-xs">{act.name[0]}</div>
                        <div className="flex-1 border-b border-slate-50 pb-4">
                          <div className="flex justify-between items-start"><span className="text-sm font-extrabold group-hover:text-cyan-600 transition-colors">{act.name}</span><span className="text-[9px] font-bold text-slate-400 uppercase">{act.time}</span></div>
                          <div className="text-xs font-bold text-cyan-600 mt-1 uppercase tracking-tighter">{act.session}</div>
                          <div className="flex items-center gap-3 mt-2"><span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${act.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{act.status}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RPE: {act.rpe}</span></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 h-fit">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-6"><h3 className="text-xl font-black uppercase tracking-tighter">Squad Leaderboard</h3><TrophyIcon size={20} className="text-amber-500" /></div>
                  <div className="space-y-4">
                    {teams[0].players.slice(0, 5).map((p, i) => (
                      <div key={p.id} onClick={() => setViewingPlayer(p)} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="flex items-center gap-4"><span className="w-6 text-xs font-black text-slate-300">#0{i + 1}</span><span className="text-sm font-extrabold">{p.name}</span></div>
                        <div className="flex items-center gap-3"><span className="text-xs font-black text-slate-900">34.2 km/h</span><TrendingUpIcon size={14} className="text-emerald-500" /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 h-fit">
                  <button onClick={() => setIsDashboardCalendarOpen(true)} className="w-full flex justify-between items-center border-b border-slate-50 pb-6 group cursor-pointer"><h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-cyan-600 transition-colors">Upcoming Sessions</h3><CalendarDaysIcon size={20} className="text-slate-300 group-hover:text-cyan-500 transition-colors" /></button>
                  <div className="space-y-4">
                    {scheduledSessions.slice(0, 3).map((item, i) => (
                      <button key={i} onClick={() => setViewingSession(item)} className="w-full flex items-center gap-5 p-4 rounded-3xl border border-slate-50 hover:border-cyan-200 hover:bg-slate-50 text-left transition-all cursor-pointer">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0"><span className="text-[10px] font-black uppercase">{new Date(item.date).toLocaleDateString('en-GB', { month: 'short' })}</span><span className="text-lg font-black leading-none">{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric' })}</span></div>
                        <div className="flex-1 min-w-0"><div className="text-sm font-extrabold truncate">{item.title}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.targetId}</div></div>
                        <div className={`w-3 h-3 rounded-full ${getLoadColor(item.load).split(' ')[0]}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <PrinterIcon size={20} className="text-cyan-600" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Prescription Generators</h4>
                  </div>
                  <button onClick={() => setIsWeightroomSheetModalOpen(true)} className="w-full bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-xl hover:scale-[1.01] transition-all group border-l-[12px] border-l-cyan-600">
                    <div className="space-y-2 text-left">
                      <h3 className="text-xl font-black uppercase tracking-tighter">Weightroom Sheets [V2]</h3>
                      <p className="text-slate-400 text-xs font-medium">Generate daily printable prescribed load sheets for individual athletes or squads.</p>
                    </div>
                    <div className="w-12 h-12 rounded-[1rem] bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all"><ArrowRightIcon size={24} /></div>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <FileStackIcon size={20} className="text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Bundle Compilers</h4>
                  </div>
                  <button onClick={() => setIsWorkoutPacketModalOpen(true)} className="w-full bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-xl hover:scale-[1.01] transition-all group border-l-[12px] border-l-indigo-600">
                    <div className="space-y-2 text-left">
                      <h3 className="text-xl font-black uppercase tracking-tighter">Workout Packets</h3>
                      <p className="text-slate-400 text-xs font-medium">Compile multi-session intervention packages for off-site training or homework.</p>
                    </div>
                    <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowRightIcon size={24} /></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'periodization' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-end bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden border-t-8 border-t-slate-900">
                <div className="space-y-4 relative z-10">
                  <h2 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tighter leading-none">The Planner</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Periodization Terminal // Macro Management</p>
                </div>
                <div className="flex items-center gap-6 z-10">
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:bg-black">
                    <PlusIcon size={16} /> New Phase
                  </button>
                  <div className="flex bg-slate-100 p-1 rounded-xl">{['Team', 'Individual'].map(lvl => <button key={lvl} onClick={() => setPlanningLevel(lvl as any)} className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${planningLevel === lvl ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{lvl}</button>)}</div>
                </div>
              </div>
              {renderTimeline()}
            </div>
          )}

          {activeTab === 'library' && renderExerciseLibrary()}
          {activeTab === 'conditioning' && renderConditioningHub()}
          {activeTab === 'reports' && renderReportingHub()}
          {activeTab === 'analytics' && renderAnalyticsHub()}

          {activeTab === 'clients' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-end bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden border-t-8 border-t-slate-900">
                <div className="space-y-4 relative z-10">
                  <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Athlete Roster</h2>
                  <p className="text-slate-400 text-lg italic leading-relaxed font-medium">Monitoring terminal for research subjects and high-performance units.</p>
                </div>
                <button className="bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] text-[12px] font-bold uppercase tracking-[0.2em] shadow-2xl flex items-center gap-5 active:scale-95 transition-all z-10 hover:bg-black"><UserPlusIcon size={20} /> Add Athlete</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {teams.map(team => (
                  <div key={team.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col border-t-8 border-t-slate-900 group">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                      <div className="flex flex-col">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-cyan-600 transition-colors">{team.name}</h4>
                      </div>
                      <ShieldIcon size={32} className="text-slate-100 group-hover:text-cyan-500" />
                    </div>
                    <div className="space-y-4 flex-1">
                      {team.players.map(player => (
                        <button key={player.id} onClick={() => setViewingPlayer(player)} className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] hover:bg-slate-900 hover:text-white transition-all shadow-sm group/row">
                          <span className="text-base font-extrabold truncate">{player.name}</span>
                          <ChevronRightIcon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>



      {/* DUAL-TAB PLANNER BLOCK MODAL */}
      {
        isPlanBlockModalOpen && selectedPlanBlock && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 border-t-8 border-t-slate-900">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPlanBlock.color}`}>
                    <CalendarIcon size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{selectedPlanBlock.title}</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Periodization Block Terminal</span>
                  </div>
                </div>
                <button onClick={() => setIsPlanBlockModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><XIcon size={24} /></button>
              </div>

              <div className="flex border-b border-slate-100 px-8 bg-slate-50/30 shrink-0">
                <button onClick={() => setPlanBlockTab('info')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${planBlockTab === 'info' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Overview</button>
                <button onClick={() => setPlanBlockTab('edit')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${planBlockTab === 'edit' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Edit Settings</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white">
                {planBlockTab === 'info' ? (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="p-5 bg-slate-50 rounded-2xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Start Date</span>
                        <span className="text-sm font-black text-slate-900">{selectedPlanBlock.startDate}</span>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">End Date</span>
                        <span className="text-sm font-black text-slate-900">{selectedPlanBlock.endDate}</span>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phase Intensity</span>
                        <span className="text-sm font-black text-slate-900">{selectedPlanBlock.blockType}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Coach's Strategic Notes</h4>
                      <p className="text-sm text-slate-600 leading-relaxed italic">{selectedPlanBlock.notes || 'No specific strategic notes defined for this period.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Block Title</label>
                      <input type="text" defaultValue={selectedPlanBlock.title} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">Notes & Strategy</label>
                      <textarea defaultValue={selectedPlanBlock.notes} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold h-32 shadow-sm" />
                    </div>
                    <div className="pt-4">
                      <button className="text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 p-3 rounded-xl transition-all">
                        <Trash2Icon size={14} /> Delete Phase
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-white px-8 flex justify-end gap-4 shrink-0">
                <button onClick={() => setIsPlanBlockModalOpen(false)} className="px-8 py-4 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase text-slate-500">Close</button>
                {planBlockTab === 'edit' && <button onClick={() => setIsPlanBlockModalOpen(false)} className="px-12 py-4 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase shadow-xl">Save Changes</button>}
              </div>
            </div>
          </div>
        )
      }

      {/* DASHBOARD MODALS */}
      {
        isWeightroomSheetModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[95vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 border-t-8 border-t-cyan-600">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-white"><PrinterIcon size={24} /></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Weightroom Sheets</h3>
                </div>
                <button onClick={() => setIsWeightroomSheetModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><XIcon size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-slate-50/50 flex flex-col gap-8">
                {/* Configuration Header */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Squad</label>
                    <select value={wrSelectedTeam} onChange={(e) => setWrSelectedTeam(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-bold outline-none appearance-none">
                      <option value="All">All Athletes</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sheet Mode</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <button onClick={() => setWsMode('blank')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${wsMode === 'blank' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Blank Form</button>
                      <button onClick={() => setWsMode('advanced')} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${wsMode === 'advanced' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>Advanced</button>
                    </div>
                  </div>
                  <button onClick={() => {
                    const newId = 'c' + (wsColumns.length + 1);
                    setWsColumns([...wsColumns, { id: newId, label: 'New Column', type: 'blank', exerciseId: '', metric: '' }]);
                  }} className="w-full bg-cyan-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlusIcon size={16} /> Add Column
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Preview Table */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Live Print Preview</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {(wrSelectedTeam === 'All' ? teams.flatMap(t => t.players) : teams.find(t => t.id === wrSelectedTeam)?.players || []).length} Athletes Listed
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-100 w-[200px]">Athlete</th>
                              {wsColumns.map(col => (
                                <th key={col.id} className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-900 border-r border-slate-100 text-center min-w-[150px]">
                                  {col.label}
                                  {wsMode === 'advanced' && col.type === '1rm' && col.metric && <div className="text-[8px] text-cyan-500 mt-1">@{col.metric}% Est.</div>}
                                </th>
                              ))}
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-300 italic text-right">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(wrSelectedTeam === 'All' ? teams.flatMap(t => t.players) : teams.find(t => t.id === wrSelectedTeam)?.players || []).map(player => (
                              <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6 text-sm font-bold text-slate-900 border-r border-slate-100">{player.name}</td>
                                {wsColumns.map(col => {
                                  let displayValue = '---';
                                  if (wsMode === 'advanced' && col.type === '1rm' && col.exerciseId) {
                                    const current1RM = player.oneRM[col.exerciseId] || 0;
                                    if (current1RM > 0 && col.metric) displayValue = Math.round(current1RM * (Number(col.metric) / 100)).toString();
                                  }
                                  return (
                                    <td key={col.id} className="p-6 text-center border-r border-slate-100">
                                      <div className={`mx-auto h-8 w-16 flex items-center justify-center rounded-lg font-black text-xs ${wsMode === 'blank' || displayValue === '---' ? 'border border-dashed border-slate-200 text-slate-200' : 'bg-cyan-50 text-cyan-700'}`}>
                                        {wsMode === 'blank' || displayValue === '---' ? '' : displayValue}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="p-6 border-slate-100"></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Column Config & Actions */}
                  <div className="space-y-6">
                    <div className="bg-cyan-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6 flex flex-col justify-between h-fit">
                      <div className="space-y-4">
                        <PrinterIcon size={40} className="text-cyan-400" />
                        <h4 className="text-xl font-black uppercase tracking-tight leading-tight">Sheet Ready</h4>
                        <p className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest leading-relaxed">System will generate a high-contrast PDF optimized for clipboard usage in the weightroom.</p>
                      </div>
                      <div className="pt-6 border-t border-cyan-800">
                        <button onClick={() => window.print()} className="w-full bg-white text-cyan-900 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                          <PrinterIcon size={20} /> Print Sheet
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Columns ({wsColumns.length})</h5>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {wsColumns.map((col, idx) => (
                          <div key={col.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase text-cyan-600">Column {idx + 1}</span>
                              <button onClick={() => setWsColumns(wsColumns.filter(c => c.id !== col.id))} className="text-slate-300 hover:text-red-500"><Trash2Icon size={12} /></button>
                            </div>
                            <input type="text" value={col.label} onChange={(e) => setWsColumns(wsColumns.map(c => c.id === col.id ? { ...c, label: e.target.value } : c))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold outline-none" placeholder="Label" />

                            {wsMode === 'advanced' && (
                              <>
                                <select value={col.type} onChange={(e) => setWsColumns(wsColumns.map(c => c.id === col.id ? { ...c, type: e.target.value } : c))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold outline-none">
                                  <option value="blank">Blank</option>
                                  <option value="1rm">1RM %</option>
                                </select>
                                {col.type === '1rm' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <input type="number" placeholder="%" value={col.metric} onChange={(e) => setWsColumns(wsColumns.map(c => c.id === col.id ? { ...c, metric: e.target.value } : c))} className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold outline-none" />
                                    <select value={col.exerciseId} onChange={(e) => setWsColumns(wsColumns.map(c => c.id === col.id ? { ...c, exerciseId: e.target.value } : c))} className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold outline-none">
                                      <option value="">Exercise</option>
                                      {exercises.filter(e => e.trackingType === '1RM').map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                    </select>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8">
                <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Team Sheet // {teams.find(t => t.id === wrSelectedTeam)?.name || 'Full Roster'}</h1>
                  <div className="text-right text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</div>
                </div>
                <table className="w-full border-2 border-black border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-black p-2 text-xs font-black uppercase bg-slate-100">Athlete</th>
                      {wsColumns.map(c => <th key={c.id} className="border-2 border-black p-2 text-xs font-black uppercase bg-slate-100 text-center">{c.label} {c.metric && `@${c.metric}%`}</th>)}
                      <th className="border-2 border-black p-2 text-xs font-black uppercase bg-slate-100 w-32">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(wrSelectedTeam === 'All' ? teams.flatMap(t => t.players) : teams.find(t => t.id === wrSelectedTeam)?.players || []).map(p => (
                      <tr key={p.id}>
                        <td className="border-2 border-black p-3 text-sm font-bold uppercase">{p.name}</td>
                        {wsColumns.map(c => {
                          let val = '';
                          if (wsMode === 'advanced' && c.type === '1rm' && c.exerciseId && c.metric) {
                            const m = p.oneRM[c.exerciseId];
                            if (m) val = Math.round(m * (Number(c.metric) / 100)).toString();
                          }
                          return <td key={c.id} className="border-2 border-black p-3 text-center text-sm font-black">{val}</td>;
                        })}
                        <td className="border-2 border-black p-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {
        isWorkoutPacketModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 border-t-8 border-t-indigo-600">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Workout Packets</h3>
                <button onClick={() => setIsWorkoutPacketModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><XIcon size={24} /></button>
              </div>
              <div className="flex-1 p-12 bg-slate-50/20 overflow-y-auto no-scrollbar space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Intervention Window</label>
                    <div className="flex gap-2">
                      <input type="date" className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-4 text-[10px] font-bold outline-none shadow-sm" />
                      <input type="date" className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-4 text-[10px] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                </div>
                <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
                  <LayersIcon size={48} className="text-slate-200" />
                  <span className="text-sm font-medium text-slate-400">Aggregating longitudinal microcycles for batch compilation...</span>
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-white flex justify-end gap-4 shrink-0">
                <button className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">Compile Packet</button>
              </div>
            </div>
          </div>
        )
      }

      {/* REPORT MODAL */}
      {
        activeReport && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 border-t-8 border-t-slate-900">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><BarChartIcon size={24} /></div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{activeReport} Terminal</h3>
                </div>
                <button onClick={() => setActiveReport(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><XIcon size={24} /></button>
              </div>
              <div className="flex-1 p-12 bg-slate-50/20 overflow-y-auto no-scrollbar">
                {activeReport === 'Activity' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black uppercase tracking-tighter">Squad Activity (Last 14 Days)</h4>
                          <p className="text-xs text-slate-400 font-medium">Aggregate internal load distribution across selected subjects.</p>
                        </div>
                        <div className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedAthleteId === 'all' ? 'Full Squad' : selectedAthlete?.name}</div>
                      </div>
                      <div className="h-64 border-b border-slate-100 flex items-end gap-3 pb-2 pt-10">
                        {filteredTelemetry.slice(-14).map((t, idx) => {
                          const h = (t.rpe / 10) * 100;
                          return (
                            <div key={idx} className="flex-1 bg-slate-900/5 hover:bg-slate-900/10 transition-all rounded-t-xl relative group flex flex-col justify-end" style={{ height: '100%' }}>
                              <div className="w-full bg-slate-900 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">RPE {t.rpe}</div>
                              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 rotate-45">{t.date.split('-')[2]}/{t.date.split('-')[1]}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-4 gap-6 pt-6">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Max RPE</span>
                          <span className="text-xl font-black text-slate-900">{Math.max(...filteredTelemetry.slice(-14).map(t => t.rpe), 0)}</span>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Mean RPE</span>
                          <span className="text-xl font-black text-slate-900">{(filteredTelemetry.slice(-14).reduce((a, b) => a + b.rpe, 0) / 14).toFixed(1)}</span>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Compliance</span>
                          <span className="text-xl font-black text-emerald-500">100%</span>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Alerts</span>
                          <span className="text-xl font-black text-rose-500">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeReport === 'Progress Report' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="text-2xl font-black uppercase tracking-tighter">Strength Progression</h4>
                          <p className="text-xs text-slate-400 font-medium tracking-tight">Longitudinal tracking of benchmark metrics (Estimated 1RM)</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none">
                          <option>Back Squat</option>
                          <option>Bench Press</option>
                        </select>
                      </div>

                      {selectedAthleteId === 'all' ? (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50">
                          <p className="text-xs font-bold text-slate-400 uppercase italic">Select individual athlete to view longitudinal progress</p>
                        </div>
                      ) : (
                        <div className="h-64 relative flex items-end">
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 240">
                            <polyline
                              fill="none"
                              stroke="#0891b2"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={(selectedAthlete?.performanceHistory.filter(h => h.metric.includes('1RM')) || []).map((h, i, arr) => {
                                const x = arr.length > 1 ? (i / (arr.length - 1)) * 800 : 400;
                                const y = 200 - ((h.value / 250) * 200);
                                return `${x},${y}`;
                              }).join(' ')}
                            />
                            {(selectedAthlete?.performanceHistory.filter(h => h.metric.includes('1RM')) || []).map((h, i, arr) => {
                              const x = arr.length > 1 ? (i / (arr.length - 1)) * 800 : 400;
                              const y = 200 - ((h.value / 250) * 200);
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="6" fill="#0891b2" />
                                  <text x={x} y={y - 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0891b2">{h.value}kg</text>
                                  <text x={x} y={230} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#94a3b8">{h.date}</text>
                                </g>
                              )
                            })}
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeReport !== 'Activity' && activeReport !== 'Progress Report' && (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-cyan-500 animate-pulse"><ZapIcon size={40} /></div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900">Configuring Analysis Engine</h4>
                      <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">Retrieving telemetry records and diagnostic logs for selected subjects.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-slate-100 bg-white flex justify-end gap-4 shrink-0">
                <button className="px-12 py-4 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase shadow-xl hover:bg-black transition-all">Export Report</button>
              </div>
            </div>
          </div>
        )
      }

      {/* ATHLETE PROFILE MODAL */}
      {
        viewingPlayer && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[95vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border-t-8 border-t-slate-900">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl">{viewingPlayer.name[0]}</div>
                  <div className="flex flex-col">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{viewingPlayer.name}</h2>
                    <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5"><BadgeCheckIcon size={14} /> Verified Athlete</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-4 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><SettingsIcon size={20} /></button>
                  <button onClick={() => setViewingPlayer(null)} className="p-4 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all"><XIcon size={24} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-slate-50/20 no-scrollbar space-y-10">
                <div className="grid grid-cols-4 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><span className="text-[10px] font-black uppercase text-slate-400">Adherence</span><div className="text-2xl font-black text-slate-900">{viewingPlayer.adherence}%</div></div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><span className="text-[10px] font-black uppercase text-slate-400">Age</span><div className="text-2xl font-black text-slate-900">{viewingPlayer.age}</div></div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><span className="text-[10px] font-black uppercase text-slate-400">Subsection</span><div className="text-2xl font-black text-slate-900">{viewingPlayer.subsection}</div></div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"><span className="text-[10px] font-black uppercase text-slate-400">Gender</span><div className="text-2xl font-black text-slate-900">{viewingPlayer.gender}</div></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter border-b border-slate-100 pb-4">Biometric Monitoring</h3>
                    <div className="h-64 flex items-center justify-center text-slate-300 uppercase font-black tracking-widest text-lg">Load Distribution Offline</div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter border-b border-slate-100 pb-4">Performance History</h3>
                    <div className="space-y-4">
                      {viewingPlayer.performanceHistory.map((rec, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                          <span className="text-xs font-bold text-slate-500 uppercase">{rec.metric}</span>
                          <span className="text-sm font-black text-slate-900">{rec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ACWR Detail Modal */}
      {
        acwrDetailAthlete && (() => {
          const loads = acwrDetailAthlete.telemetry.map(t => t.rpe * 60);
          const acuteLoad = calculateEWMA(loads, 7);
          const chronicLoad = calculateEWMA(loads, 28);
          const acwr = calculateACWR(acuteLoad, chronicLoad);
          const status = getACWRStatus(acwr);
          const last28Days = acwrDetailAthlete.telemetry.slice(-28);
          const avgWellness = last28Days.reduce((sum, t) => sum + t.wellness.readinessScore, 0) / last28Days.length;

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8 animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{acwrDetailAthlete.name}</h2>
                      <p className="text-sm text-slate-400 font-bold uppercase">{acwrDetailAthlete.subsection} • ACWR Analysis</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-6 py-3 rounded-2xl ${status.bgColor} border-2 ${status.color.replace('text-', 'border-')}`}>
                        <span className={`text-lg font-black uppercase ${status.color}`}>{status.status}</span>
                      </div>
                      <button onClick={() => setAcwrDetailAthlete(null)} className="w-12 h-12 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                        <XIcon size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                  {/* ACWR Value & Risk */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Current ACWR</span>
                      <span className="text-4xl font-black text-slate-900">{acwr.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Acute Load (7d)</span>
                      <span className="text-4xl font-black text-slate-900">{acuteLoad.toFixed(0)}</span>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Chronic Load (28d)</span>
                      <span className="text-4xl font-black text-slate-900">{chronicLoad.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`p-6 rounded-2xl ${status.bgColor} border-2 ${status.color.replace('text-', 'border-')}`}>
                    <h4 className={`text-sm font-black uppercase mb-2 ${status.color}`}>Risk Assessment</h4>
                    <p className="text-sm font-medium text-slate-700">{status.risk} - {
                      status.status === 'Optimal' ? 'Athlete is in the sweet spot for adaptation and performance gains.' :
                        status.status === 'Caution' ? 'Monitor closely. Consider reducing training load or adding recovery.' :
                          status.status === 'Danger' ? 'HIGH RISK: Immediate intervention required. Reduce load significantly.' :
                            'Athlete may be detraining. Consider increasing training stimulus.'
                    }</p>
                  </div>

                  {/* Load Chart */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-black uppercase text-slate-400 mb-4">Load Progression (Last 28 Days)</h4>
                    <div className="flex items-end gap-1 h-48">
                      {last28Days.map((t, idx) => {
                        const height = (t.rpe / 10) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-6 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              RPE {t.rpe}
                            </div>
                            <div className="w-full bg-cyan-500 rounded-t transition-all group-hover:bg-cyan-600" style={{ height: `${height}%` }}></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wellness Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Avg Readiness</span>
                      <span className="text-2xl font-black text-slate-900">{avgWellness.toFixed(0)}%</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Avg Sleep</span>
                      <span className="text-2xl font-black text-slate-900">{(last28Days.reduce((s, t) => s + t.wellness.sleep, 0) / last28Days.length).toFixed(1)}h</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Avg Stress</span>
                      <span className="text-2xl font-black text-slate-900">{(last28Days.reduce((s, t) => s + t.wellness.stress, 0) / last28Days.length).toFixed(1)}/10</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Avg Soreness</span>
                      <span className="text-2xl font-black text-slate-900">{(last28Days.reduce((s, t) => s + t.wellness.soreness, 0) / last28Days.length).toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      }
    </div >
  );
}
