import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Wind, 
  Droplet, 
  AlertTriangle, 
  Play, 
  Square, 
  Grid, 
  Radio, 
  Video, 
  Thermometer,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { Patient, CameraFeed, SystemSettings, SessionRecord } from '../types';

interface DashboardViewProps {
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patient: Patient) => void;
  systemSettings: SystemSettings;
  onAddSession: (session: SessionRecord) => void;
}

export default function DashboardView({
  patients,
  selectedPatient,
  onSelectPatient,
  systemSettings,
  onAddSession
}: DashboardViewProps) {
  // Simulator State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [simulateStress, setSimulateStress] = useState(false);
  
  // Dynamic physiological values
  const [heartRate, setHeartRate] = useState(120);
  const [respRate, setRespRate] = useState(24);
  const [spO2, setSpO2] = useState(98);
  const [bodyTempOffset, setBodyTempOffset] = useState(systemSettings.irOffsetTemp);
  const [nodesSync, setNodesSync] = useState([true, true, true, false]); // array of signals
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  // Stats averages accumulators for recording
  const recordedHrSum = useRef<number[]>([]);
  const recordedRrSum = useRef<number[]>([]);
  const recordedO2Sum = useRef<number[]>([]);

  // Timer Ref
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic values fluctuating based on baseline values of the selected animal species
  useEffect(() => {
    let baseHR = 110;
    let baseRR = 24;
    let baseO2 = 98;

    if (selectedPatient.species === 'Dog') {
      baseHR = selectedPatient.weight > 20 ? 100 : 125;
      baseRR = 22;
    } else if (selectedPatient.species === 'Cat') {
      baseHR = 145;
      baseRR = 28;
    } else if (selectedPatient.species === 'Rabbit') {
      baseHR = 200;
      baseRR = 50;
    } else {
      baseHR = 80;
      baseRR = 18;
    }

    if (simulateStress) {
      baseHR = Math.floor(baseHR * 1.35);
      baseRR = Math.floor(baseRR * 1.6);
      baseO2 = baseO2 - 2;
    }

    // Dynamic initial values
    setHeartRate(baseHR);
    setRespRate(baseRR);
    setSpO2(baseO2);
  }, [selectedPatient, simulateStress]);

  // Fluctuations interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartRate(prev => {
        let drift = Math.floor(Math.random() * 5) - 2;
        if (simulateStress) drift += Math.floor(Math.random() * 3) - 1;
        const next = prev + drift;
        if (isRecording) recordedHrSum.current.push(next);
        return next;
      });

      setRespRate(prev => {
        let drift = Math.floor(Math.random() * 3) - 1;
        const next = Math.max(5, prev + drift);
        if (isRecording) recordedRrSum.current.push(next);
        return next;
      });

      setSpO2(prev => {
        const drift = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const next = Math.min(100, Math.max(85, prev + drift));
        if (isRecording) recordedO2Sum.current.push(next);
        return next;
      });

      // Randomize axis correlation slight flicker
      setBodyTempOffset(prev => {
        const variation = (Math.random() * 0.1) - 0.05;
        const target = simulateStress ? systemSettings.irOffsetTemp + 1.2 : systemSettings.irOffsetTemp;
        return parseFloat((prev * 0.95 + target * 0.05 + variation).toFixed(2));
      });

      // Fluctuate node health lights
      setNodesSync(prev => {
        return prev.map((val, idx) => {
          if (idx === 3 && simulateStress) return true; // Rear sensor gets strong signals under panting
          return Math.random() > 0.95 ? !val : val;
        });
      });

    }, 1500);

    return () => clearInterval(timer);
  }, [simulateStress, isRecording, systemSettings.irOffsetTemp]);

  // Handle Recording sequence
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording & finalize session
      const duration = recordingSeconds;
      const avgHR = recordedHrSum.current.length > 0
        ? Math.round(recordedHrSum.current.reduce((a, b) => a + b, 0) / recordedHrSum.current.length)
        : heartRate;
      const avgRR = recordedRrSum.current.length > 0
        ? Math.round(recordedRrSum.current.reduce((a, b) => a + b, 0) / recordedRrSum.current.length)
        : respRate;
      const avgO2 = recordedO2Sum.current.length > 0
        ? Math.round(recordedO2Sum.current.reduce((a, b) => a + b, 0) / recordedO2Sum.current.length)
        : spO2;

      const newSession: SessionRecord = {
        id: 'S_' + Date.now(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        timestamp: new Date().toISOString(),
        durationSeconds: duration,
        avgHeartRate: avgHR,
        avgRespRate: avgRR,
        avgSpO2: avgO2,
        pantingDetected: simulateStress || avgRR > systemSettings.alertRespRateMax,
        notes: `Dynamic telemetry sync duration: ${duration}s. Inspected channels CAM_01 through CAM_04. Subject state: ${simulateStress ? 'DISTRESSED / PANTING SIMULATOR_ACTIVE' : 'STABLE BASELINE'}.`
      };

      onAddSession(newSession);
      setIsRecording(false);
      setRecordingSeconds(0);
      recordedHrSum.current = [];
      recordedRrSum.current = [];
      recordedO2Sum.current = [];
      alert(`Recording complete! Session successfully cached for ${selectedPatient.name}.`);
    } else {
      // Start recording
      recordedHrSum.current = [heartRate];
      recordedRrSum.current = [respRate];
      recordedO2Sum.current = [spO2];
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  // Waveform Renderer Phase
  const [wavePhase, setWavePhase] = useState(0);
  const reqRef = useRef<number | null>(null);

  useEffect(() => {
    const handleAnimationFrame = () => {
      setWavePhase(prev => prev + (simulateStress ? 0.35 : 0.18));
      reqRef.current = requestAnimationFrame(handleAnimationFrame);
    };
    reqRef.current = requestAnimationFrame(handleAnimationFrame);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [simulateStress]);

  // Generate nice organic path
  const generateWavePath = () => {
    let d = "M 0 50 ";
    const segments = 120;
    const heightScale = simulateStress ? 24 : 15;
    const frequency = simulateStress ? 0.08 : 0.045;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 1000;
      // Synthesize a primary heart heartbeat loop, high dicrotic notch, and minor respiratory wave
      const baseSin = Math.sin(i * frequency + wavePhase);
      const harmonicSin = Math.sin(i * frequency * 2.3 + wavePhase * 1.5) * 0.4;
      const noise = (Math.sin(i * 0.95 + wavePhase * 12) * 1.1);
      
      const y = 50 + (baseSin + harmonicSin) * heightScale + noise;
      d += `L ${x} ${y} `;
    }
    return d;
  };

  const formattedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate coordinates for tri-axis correlation visualization
  const getCoordinatesForAxis = () => {
    // Standard equilateral triangle bounding vertices
    // Top Z: (50, 15)
    // Bottom Right Y: (85, 75)
    // Bottom Left X: (15, 75)
    // We adjust them slightly depending on simulated stress or selected patient ratios
    const modifier = simulateStress ? 12 : 0;
    const zX = 50;
    const zY = 15 - (modifier * 0.4);
    const yX = 85 + (modifier * 0.5);
    const yY = 75 + (modifier * 0.3);
    const xX = 15 - (modifier * 0.5);
    const xY = 75 + (modifier * 0.3);

    return `${zX} ${zY} L ${yX} ${yY} L ${xX} ${xY} Z`;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background text-on-background overflow-hidden h-full min-h-[calc(100vh-64px)]">
      {/* Central Diagnostic Area (Quad View) */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-y-auto lg:overflow-hidden h-full">
        
        {/* Patient Selection & Quick Parameter Adjustment Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-low/60 backdrop-blur-md p-3 border border-outline-variant/30 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="font-label-mono text-xs text-primary-fixed-dim bg-primary-fixed-dim/10 py-1 px-2.5 rounded border border-primary-fixed-dim/20">TARGET OBJECT</span>
            <select 
              value={selectedPatient.id} 
              onChange={(e) => {
                const pat = patients.find(p => p.id === e.target.value);
                if (pat) onSelectPatient(pat);
              }}
              className="bg-surface border border-outline-variant/50 text-on-background px-3 py-1 text-sm rounded-lg focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none font-sans font-medium"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-surface text-on-background">
                  {p.name} ({p.species} - {p.breed})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setSimulateStress(!simulateStress)}
              className={`px-3 py-1 rounded text-xs transition-all font-label-mono border flex items-center gap-1.5 ${
                simulateStress 
                  ? 'bg-secondary-container/20 border-secondary-container text-secondary' 
                  : 'bg-white/5 border-outline-variant/30 text-on-surface-variant/80 hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {simulateStress ? 'STRESS: SIMULATING' : 'STRESS: STABLE'}
            </button>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-outline-variant/20 rounded text-xs font-label-mono text-on-surface-variant/70">
              <Sliders className="w-3.5 h-3.5 text-primary-fixed-dim" />
              <span>FREQ: {systemSettings.sensorFrequency}Hz</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/40 text-red-400 font-mono text-xs px-2.5 py-1 rounded animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>REC {formattedTime(recordingSeconds)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quad Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* CAM 01: FRONT (RGB) */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === 'cam_01' ? null : 'cam_01')}
            className={`relative rounded-xl overflow-hidden border bg-black group transition-all duration-300 cursor-pointer ${
              selectedQuadrant === 'cam_01' 
                ? 'ring-2 ring-primary-fixed-dim shadow-[0_0_15px_rgba(0,230,57,0.3)] border-primary-fixed-dim' 
                : 'border-primary-fixed-dim/40 hover:border-primary-fixed-dim/60'
            }`}
          >
            <div className="scanline"></div>
            <img 
              alt="Patient Front View" 
              className={`w-full h-full object-cover transition-all duration-300 ${
                simulateStress ? 'opacity-70 contrast-110 saturate-120' : 'opacity-60 saturate-100'
              }`}
              src={selectedPatient.avatarUrl}
              referrerPolicy="no-referrer"
            />
            {/* Ambient bounding reticle corner styling (computer vision effect) */}
            <div className="absolute inset-4 pointer-events-none border border-primary-fixed-dim/10 rounded">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-fixed-dim"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary-fixed-dim"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary-fixed-dim"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-fixed-dim"></div>
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-primary-fixed-dim/20 backdrop-blur-md px-3 py-1 border border-primary-fixed-dim/50 rounded">
                <div className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></div>
                <span className="text-[10px] font-mono text-primary-fixed-dim uppercase tracking-tighter">CAM_01: FRONT (RGB)</span>
              </div>
              <div className="px-3 py-1 bg-black/40 text-[9px] font-mono text-primary-fixed-dim/80 border border-primary-fixed-dim/20 rounded">
                SPATIAL: X-AXIS / FRONT
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-primary-fixed-dim/70 uppercase">
                  CORR: {simulateStress ? '0.99' : '0.98'}
                </span>
                <svg className="w-12 h-4" viewBox="0 0 50 20">
                  <path d="M0 10 L5 8 L10 12 L15 5 L20 15 L25 10 L30 14 L35 7 L40 12 L45 9 L50 11" fill="none" opacity="0.6" stroke="#00e639" strokeWidth="1"></path>
                </svg>
              </div>
            </div>

            {/* Spatial Cube Indicator */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-none">
              <div className="spatial-cube w-7 h-7">
                <div className="absolute inset-0 bg-primary-fixed-dim/30 border border-primary-fixed-dim" style={{ transform: 'translateZ(14px)' }}></div>
              </div>
              <span className="font-mono text-[9px] text-white/50 uppercase">ANGLE: FRONT_0.0°</span>
            </div>
          </div>

          {/* CAM 02: SIDE (RGB) */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === 'cam_02' ? null : 'cam_02')}
            className={`relative rounded-xl overflow-hidden border bg-black group transition-all duration-300 cursor-pointer ${
              selectedQuadrant === 'cam_02' 
                ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.2)] border-white/60' 
                : 'border-outline-variant/30 hover:border-outline-variant/60'
            }`}
          >
            <img 
              alt="Patient Side View" 
              className="w-full h-full object-cover opacity-40 grayscale" 
              src={selectedPatient.avatarUrl}
              referrerPolicy="no-referrer"
            />
            {/* Subtle tracking overlay corners */}
            <div className="absolute inset-4 pointer-events-none border border-white/5 rounded">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/40"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/40"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/40"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/40"></div>
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1 border border-white/10 rounded">
                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-tighter">CAM_02: SIDE (RGB)</span>
              </div>
              <div className="px-3 py-1 bg-black/40 text-[9px] font-mono text-white/40 border border-white/10 rounded">
                SPATIAL: Y-AXIS / SIDE_L
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-white/40 uppercase">
                  CORR: {simulateStress ? '0.96' : '0.94'}
                </span>
                <svg className="w-12 h-4" viewBox="0 0 50 20">
                  <path d="M0 12 L5 10 L10 15 L15 8 L20 12 L25 9 L30 11 L35 13 L40 10 L45 12 L50 9" fill="none" opacity="0.3" stroke="white" strokeWidth="1"></path>
                </svg>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-none">
              <div className="spatial-cube w-7 h-7">
                <div className="absolute inset-0 bg-white/10 border border-white/30" style={{ transform: 'rotateY(90deg) translateZ(14px)' }}></div>
              </div>
              <span className="font-mono text-[9px] text-white/40 uppercase">ANGLE: SIDE_90.0°</span>
            </div>
          </div>

          {/* CAM 03: TOP/PLAN (RGB) */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === 'cam_03' ? null : 'cam_03')}
            className={`relative rounded-xl overflow-hidden border bg-black group transition-all duration-300 cursor-pointer ${
              selectedQuadrant === 'cam_03' 
                ? 'ring-2 ring-tertiary-fixed-dim shadow-[0_0_15px_rgba(0,218,243,0.3)] border-tertiary-fixed-dim' 
                : 'border-tertiary-fixed-dim/30 hover:border-tertiary-fixed-dim/50'
            }`}
          >
            <img 
              alt="Patient Top View" 
              className="w-full h-full object-cover opacity-50 grayscale-[0.4]" 
              src={selectedPatient.avatarUrl}
              referrerPolicy="no-referrer"
            />
            {/* Subtle tracking overlay corners */}
            <div className="absolute inset-4 pointer-events-none border border-tertiary-fixed-dim/10 rounded">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-tertiary-fixed-dim/40"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-tertiary-fixed-dim/40"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-tertiary-fixed-dim/40"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-tertiary-fixed-dim/40"></div>
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-tertiary-fixed-dim/20 backdrop-blur-md px-3 py-1 border border-tertiary-fixed-dim/50 rounded">
                <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-ping"></div>
                <span className="text-[10px] font-mono text-tertiary-fixed-dim uppercase tracking-tighter">CAM_03: TOP (RGB)</span>
              </div>
              <div className="px-3 py-1 bg-black/40 text-[9px] font-mono text-tertiary-fixed-dim/60 border border-tertiary-fixed-dim/20 rounded">
                SPATIAL: Z-AXIS / PLAN
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-tertiary-fixed-dim/50 uppercase">
                  CORR: {simulateStress ? '0.98' : '0.97'}
                </span>
                <svg className="w-12 h-4" viewBox="0 0 50 20">
                  <path d="M0 10 L8 5 L16 15 L24 8 L32 12 L40 6 L50 10" fill="none" opacity="0.5" stroke="#00daf3" strokeWidth="1"></path>
                </svg>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-none">
              <div className="spatial-cube w-7 h-7">
                <div className="absolute inset-0 bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/30" style={{ transform: 'rotateX(90deg) translateZ(14px)' }}></div>
              </div>
              <span className="font-mono text-[9px] text-white/40 uppercase">ANGLE: PLAN_TOP</span>
            </div>
          </div>

          {/* CAM 04: ISOMETRIC/REAR (IR SENSOR) */}
          <div 
            onClick={() => setSelectedQuadrant(selectedQuadrant === 'cam_04' ? null : 'cam_04')}
            className={`relative rounded-xl overflow-hidden border bg-black group transition-all duration-300 cursor-pointer shadow-[inset_0_0_20px_rgba(254,148,0,0.1)] ${
              selectedQuadrant === 'cam_04' 
                ? 'ring-2 ring-secondary-container shadow-[0_0_15px_rgba(254,148,0,0.3)] border-secondary-container' 
                : 'border-secondary-container/40 hover:border-secondary-container/60'
            }`}
          >
            <img 
              alt="Thermal View" 
              className={`w-full h-full object-cover opacity-60 transition-colors duration-500 ${
                simulateStress ? 'sepia hue-rotate-15 contrast-150 saturate-150' : 'sepia contrast-125'
              }`}
              src={selectedPatient.avatarUrl}
              referrerPolicy="no-referrer"
            />
            {/* Subtle tracking overlay corners */}
            <div className="absolute inset-4 pointer-events-none border border-secondary-container/10 rounded">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary-container/40"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary-container/40"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary-container/40"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary-container/40"></div>
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 pointer-events-none">
              <div className="flex items-center gap-2 bg-secondary-container/30 backdrop-blur-md px-3 py-1 border border-secondary-container/60 rounded shadow shadow-secondary-container/20">
                <Thermometer className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-mono text-white uppercase tracking-tighter font-bold">MODE: INFRARED</span>
              </div>
              <div className="px-3 py-1 bg-black/60 text-[9px] font-mono text-secondary border border-secondary/35 rounded">
                CAM_04: REAR SENSORS
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-secondary/70 uppercase">
                  CORR: {simulateStress ? '0.94' : '0.91'}
                </span>
                <svg className="w-12 h-4" viewBox="0 0 50 20">
                  <path d="M0 15 L10 10 L20 12 L30 5 L40 15 L50 10" fill="none" opacity="0.5" stroke="#ffbc7c" strokeWidth="1"></path>
                </svg>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-none">
              <div className="spatial-cube w-7 h-7">
                <div className="absolute inset-0 bg-secondary/35 border border-secondary/50" style={{ transform: 'rotateY(180deg) translateZ(14px)' }}></div>
              </div>
              <span className="font-mono text-[9px] text-secondary font-bold uppercase">MODE: THERMAL_MAP</span>
            </div>
          </div>
        </div>

        {/* PPG Waveform Bottom (Aggregated Stream) */}
        <div className="h-[140px] glass-panel rounded-xl border border-outline-variant/30 p-4 flex gap-6 shrink-0 relative overflow-hidden">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1 z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-on-surface-variant/70 uppercase tracking-wide">
                  Aggregated Multi-Node Stream Output
                </span>
                <div className="px-2.5 py-0.5 rounded-full bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 text-[9px] font-mono text-primary-fixed-dim flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary-fixed-dim animate-ping"></span>
                  SYNC: FUSION_CORE_ACTIVE
                </div>
              </div>
              <span className="font-mono text-[10px] text-primary-fixed-dim/90 animate-pulse">
                FUSION_STABILITY: {simulateStress ? '0.974' : '0.992'}
              </span>
            </div>

            <div className="flex-1 relative mt-1 min-h-[50px]">
              {/* Dynamic Simulated Sweep Grid Background */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                <path 
                  d={generateWavePath()} 
                  fill="none" 
                  stroke={simulateStress ? '#ffbc7c' : '#00e639'} 
                  strokeWidth="1.8"
                  className="transition-colors duration-500"
                ></path>
                <line stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" x1="0" x2="1000" y1="20" y2="20"></line>
                <line stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" x1="0" x2="1000" y1="50" y2="50"></line>
                <line stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" x1="0" x2="1000" y1="80" y2="80"></line>
              </svg>
            </div>
          </div>

          <div className="w-32 flex flex-col items-center justify-center border-l border-outline-variant/20 pl-4 shrink-0">
            <span className="text-[8px] font-mono text-on-surface-variant/40 uppercase mb-2">Axis Correlation</span>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" strokeWidth="0.5"></circle>
                
                {/* Dynamic Coordinate Triangle */}
                <path 
                  d={getCoordinatesForAxis()} 
                  fill={simulateStress ? 'rgba(254,148,0,0.2)' : 'rgba(0,230,57,0.2)'} 
                  stroke={simulateStress ? '#fe9400' : '#00e639'} 
                  strokeWidth="1"
                  className="transition-all duration-500"
                ></path>
                
                <text fill="white" fontSize="8" textAnchor="middle" x="50" y="8" className="font-mono">Z</text>
                <text fill="white" fontSize="8" textAnchor="middle" x="92" y="80" className="font-mono">Y</text>
                <text fill="white" fontSize="8" textAnchor="middle" x="8" y="80" className="font-mono">X</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Sidebar (Right) */}
      <aside className="w-full md:w-[380px] bg-surface-container-low border-t md:border-t-0 md:border-l border-outline-variant/30 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto shrink-0 custom-scrollbar h-full">
        <div>
          <h3 className="font-headline text-xl font-semibold text-on-surface">Telemetry Stack</h3>
          <p className="font-mono text-xs text-on-surface-variant/60 uppercase">
            Source: Multi-Node Fusion Engine
          </p>
        </div>

        {/* Sync quality gauge */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded border border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-primary-fixed-dim" />
            <span className="text-[10px] font-mono text-on-surface-variant/80 uppercase">Node Sync Quality</span>
          </div>
          <div className="flex gap-1.5">
            {nodesSync.map((node, i) => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  node ? 'bg-primary-fixed-dim shadow-[0_0_4px_#00e639]' : 'bg-primary-fixed-dim/20'
                }`}
              ></span>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {/* Heart Rate Display Card */}
          <div className={`glass-panel p-4 border rounded-xl relative overflow-hidden transition-all ${
            heartRate > systemSettings.alertHeartRateMax || heartRate < systemSettings.alertHeartRateMin
              ? 'border-red-500/40 bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              : 'border-primary-fixed-dim/20'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-on-surface-variant/60 uppercase">Heart Rate</span>
                <span className="text-[10px] font-mono text-primary-fixed-dim">FUSED: CAM_01 | CAM_02</span>
              </div>
              <Heart className={`w-4 h-4 text-primary-fixed-dim ${simulateStress ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold tracking-tight text-primary-fixed-dim">
                {heartRate}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">BPM</span>
            </div>

            {/* Simulated bar scale */}
            <div className="mt-4 flex gap-1 h-1.5">
              <div className={`flex-1 rounded-full ${heartRate > 80 ? 'bg-primary-fixed-dim' : 'bg-white/5'}`}></div>
              <div className={`flex-1 rounded-full ${heartRate > 105 ? 'bg-primary-fixed-dim' : 'bg-white/5'}`}></div>
              <div className={`flex-1 rounded-full ${heartRate > 125 ? 'bg-primary-fixed-dim/80' : 'bg-white/5'}`}></div>
              <div className={`flex-1 rounded-full ${heartRate > 150 ? 'bg-secondary' : 'bg-white/5'}`}></div>
              <div className={`flex-1 rounded-full ${heartRate > 180 ? 'bg-red-500' : 'bg-white/5'}`}></div>
            </div>
          </div>

          {/* Respiratory Rate Display Card */}
          <div className={`glass-panel p-4 border rounded-xl transition-all ${
            respRate > systemSettings.alertRespRateMax || respRate < systemSettings.alertRespRateMin
              ? 'border-red-500/40 bg-red-950/10'
              : 'border-white/5'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-on-surface-variant/60 uppercase">Resp. Rate</span>
                <span className="text-[10px] font-mono text-tertiary-fixed-dim">FUSED: CAM_03 | CAM_04</span>
              </div>
              <Wind className="w-4 h-4 text-tertiary-fixed-dim animate-pulse" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold tracking-tight text-tertiary-fixed-dim">
                {respRate}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">RR</span>
            </div>
          </div>

          {/* SpO2 Oxygen Saturation Card */}
          <div className={`glass-panel p-4 border rounded-xl transition-all ${
            spO2 < systemSettings.alertSpO2Min
              ? 'border-red-500/40 bg-red-950/10'
              : 'border-white/5'
          }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-on-surface-variant/60 uppercase">Oxygen Sat.</span>
                <span className="text-[10px] font-mono text-secondary">FUSED: CAM_01 | CAM_04</span>
              </div>
              <Droplet className="w-4 h-4 text-secondary animate-pulse" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-bold tracking-tight text-secondary">
                {spO2}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">% SpO2</span>
            </div>
          </div>

          {/* Panting Detection Alert Card */}
          {simulateStress ? (
            <div className="p-4 rounded-xl bg-orange-950/30 border border-secondary-container/40 shadow-lg animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                <span className="font-mono text-xs text-secondary uppercase font-bold tracking-wider">
                  Cross-Node Panting Detected
                </span>
              </div>
              <div className="bg-secondary-container/20 p-3 rounded-lg flex items-center justify-between">
                <span className="font-headline text-lg font-bold text-secondary uppercase">DETECTED</span>
                <AlertTriangle className="w-5 h-5 text-secondary" />
              </div>
              <p className="mt-2 text-[10px] font-mono text-secondary/70 leading-relaxed uppercase">
                High-frequency movement confirmed in Z-AXIS (CAM_03). IR heat offset confirmed in REAR (CAM_04: +{bodyTempOffset}°C).
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-primary-fixed-dim/5 border border-primary-fixed-dim/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-primary-fixed-dim shadow-[0_0_8px_#00e639]"></div>
                <span className="font-mono text-xs text-primary-fixed-dim uppercase tracking-wider font-semibold">
                  Symptom Monitor Ideal
                </span>
              </div>
              <p className="mt-1.5 text-[10px] font-mono text-on-surface-variant/50 leading-tight uppercase">
                No high-frequency chest breathing anomalies detected across channels. Thermal offset stable at +{bodyTempOffset}°C.
              </p>
            </div>
          )}

          {/* Live System Logs Display */}
          <div className="mt-2">
            <span className="font-mono text-[9px] text-on-surface-variant/40 uppercase mb-1.5 block">
              Fusion Network Log Activity
            </span>
            <div className="bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-primary-fixed-dim/60 space-y-1 max-h-[105px] overflow-y-auto">
              <p>&gt; [10:23:44] SPATIAL_ALIGNED: ALL_FEEDS_SYNCED</p>
              <p>&gt; [10:23:50] IR_MAP_NORMALIZED: VALIDATED_TRUE</p>
              <p>&gt; [10:24:12] TELEMETRY_STREAM: AGGREGATED_rPPG</p>
              {simulateStress ? (
                <p className="text-secondary">&gt; [10:24:25] PATH_DETECTION: EXCESSIVE_Z_AXIS_FLUX</p>
              ) : (
                <p>&gt; [10:24:30] NO_ANOMALIES_FOUND: BASELINE_HEALTHY</p>
              )}
            </div>
          </div>
        </div>

        {/* Global Record Panel Action */}
        <div className="mt-auto pt-4 border-t border-outline-variant/20">
          <button 
            onClick={handleToggleRecording}
            className={`w-full py-3 rounded-xl font-mono text-sm uppercase flex items-center justify-center gap-2.5 transition-all outline-none border ${
              isRecording 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' 
                : 'bg-primary-fixed-dim text-on-primary hover:bg-primary-fixed-dim/80 font-bold border-transparent'
            }`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            {isRecording ? 'STOP TELEMETRY RECORDING' : 'RECORD ALL NODES'}
          </button>
        </div>
      </aside>
    </div>
  );
}
