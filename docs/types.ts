
export type ExerciseCategory = 
  | 'Upper Body' 
  | 'Lower Body' 
  | 'Plyometrics' 
  | 'Football Specific' 
  | 'Change of Direction' 
  | 'Core' 
  | 'Conditioning' 
  | 'Power'
  | 'Strength';

export type TrackingType = '1RM' | 'Highest Weight' | 'Time' | 'Distance' | 'Reps only' | '--';

export interface WorkoutOptions {
  completionOnly: boolean;
  barSpeed: boolean;
  bodyWeight: boolean;
  peakPower: boolean;
  coachComp: boolean;
  trackRepCount: boolean;
  eachSide: boolean;
  trackVolumeLoad: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  equipment: string[];
  bodyParts: string[];
  categories: ExerciseCategory[];
  videoUrl?: string;
  trackingType: TrackingType;
  tags: string[];
  options: WorkoutOptions;
}

export interface WellnessMetrics {
  sleep: number;
  stress: number;
  soreness: number;
  mood: number;
  readinessScore: number;
}

export interface DailyTelemetry {
  date: string;
  kms: number;
  rpe: number;
  wellness?: WellnessMetrics;
}

export interface Biometrics {
  weight: number;
  height: number;
  lastUpdated: string;
}

export interface PerformanceHistoryRecord {
  date: string;
  metric: string;
  value: number;
}

export interface Player {
  id: string;
  name: string;
  subsection: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  oneRM: { [exerciseId: string]: number };
  telemetry: DailyTelemetry[];
  performanceHistory: PerformanceHistoryRecord[];
  adherence: number;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  players: Player[];
  status: 'Active' | 'Off-Season' | 'Pre-Season';
  description?: string;
}

export interface IndividualClient extends Player {
  sport: string;
}

export type LoadLevel = 'Low' | 'Medium' | 'High' | 'Maximal';
export type TrainingPhase = 
  | 'General Preparation' 
  | 'Specific Preparation' 
  | 'Pre-Competition' 
  | 'Competition' 
  | 'Tapering' 
  | 'Active Recovery' 
  | 'Return to Play';

export type BlockType = 'Low Intensity' | 'Medium Intensity' | 'Maximal Load' | 'Anthropometrics' | 'General' | 'Recovery';

export interface PlanBlock {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  row: number;
  blockType?: BlockType;
  notes?: string;
}

export interface ScheduledSession {
  id: string;
  date: string; 
  targetId: string; 
  targetType: 'Team' | 'Individual';
  load: LoadLevel;
  trainingPhase: TrainingPhase;
  title: string;
  notes: string;
  exerciseIds: string[];
  plannedDuration: number;
  actualDuration?: number;
  actualRPE?: number;
  postSessionNotes?: string;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Modified';
}

export interface ProgramTemplate {
  id: string;
  name: string;
  category: string;
  exercises: string[];
  notes: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
