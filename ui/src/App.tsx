import React, { useState } from 'react';
import { 
  Grid, 
  Radio, 
  Video, 
  Cpu, 
  Wifi, 
  Smartphone,
  ShieldAlert,
  Sliders,
  Sparkles,
  Search
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import FeasibilityView from './components/FeasibilityView';
import HistoryView from './components/HistoryView';
import PatientsView from './components/PatientsView';
import SettingsView from './components/SettingsView';

import { Patient, SessionRecord, SystemSettings } from './types';
import { INITIAL_PATIENTS, INITIAL_SESSIONS, DEFAULT_SETTINGS } from './data';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Clinical Database States
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [sessions, setSessions] = useState<SessionRecord[]>(INITIAL_SESSIONS);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(INITIAL_PATIENTS[0]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Clinician profile state
  const [clinician, setClinician] = useState({
    name: 'Dr. Aris Thorne',
    title: 'Senior Clinician',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOWIvEav7D0LomjYk7ZQvLbQu-5McBeOJdIE7Dt5VYpVr72iIF8ZTbExbWimiPeEaABadoYsLLbeAOWbS-eF9bpbCa69VVjMYwDla4K_PPVwGlfoFtcjJaBUaK9yLTubF6Dh-pcX65fwW3ma9W3t9lfiAE1RN1nXvvqFmv7s-O3uPgGbhEV1wP4bIkz5fo0KumXrmAyMqy4yulQEbi9YEsVcWcXU6LXFNWEjl9s2FHNbKFQVP-5gy6lIhnISk7gUTeFOlA0nrvyVX6'
  });

  // Appended state actions
  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleAddSession = (newSession: SessionRecord) => {
    setSessions(prev => [newSession, ...prev]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleClearAllSessions = () => {
    setSessions([]);
  };

  // Get active tab title and subtitle attributes
  const getHeaderDetails = () => {
    switch(activeTab) {
      case 'dashboard':
        return {
          title: 'SPATIAL FUSION HUD',
          subtitle: 'MULTI-NODE_NETWORK v3.0 status: active',
        };
      case 'feasibility':
        return {
          title: 'RGB FEASIBILITY ANALYSIS',
          subtitle: 'SINGLE-VIEW CANDIDATE BANK_READY',
        };
      case 'history':
        return {
          title: 'PATIENT HISTORICAL TRACES',
          subtitle: 'DIAGNOSTIC ARCHIVES & AUDIT REPORTING_READY',
        };
      case 'patients':
        return {
          title: 'CLINICAL PATIENTS DATABASE',
          subtitle: 'REGISTRATION ACTIVE STATUS: SYNCED',
        };
      case 'settings':
        return {
          title: 'SYSTEM CALIBRATION PARAMETERS',
          subtitle: 'HARDWARE PARAMETERS ENGINE CONFIGURATION',
        };
      default:
        return {
          title: 'VET-PPG MEDICAL HUD',
          subtitle: 'rPPG MULTI-STREAM INTERFACE',
        };
    }
  };

  const hDetails = getHeaderDetails();

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row font-sans overflow-x-hidden select-none">
      {/* Dynamic Left Nav Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        clinician={clinician}
      />

      {/* Main clinical workstation space */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Header mimicking high-stakes surgical workspace */}
        <header className="sticky top-0 bg-background/95 backdrop-blur-md z-50 h-16 border-b border-outline-variant/30 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim animate-pulse shadow-[0_0_8px_#00e639]"></span>
            <span className="font-headline font-bold text-lg md:text-xl tracking-wide text-primary-fixed-dim uppercase">
              {hDetails.title}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-on-surface-variant/50 border border-outline-variant/20 py-0.5 px-2 rounded-md ml-2 uppercase">
              {hDetails.subtitle}
            </span>
          </div>

          {/* Controls indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant/55 md:text-on-surface-variant bg-white/5 border border-outline-variant/20 p-1 rounded-lg">
              <button className="p-1 hover:text-primary-fixed-dim transition-colors" title="Grid Multi-Feed View">
                <Grid className="w-4 h-4 text-primary-fixed-dim" />
              </button>
              <button className="p-1 hover:text-primary-fixed-dim transition-colors" title="Telemetry Radio Sensors Connected">
                <Wifi className="w-4 h-4 text-primary-fixed-dim" />
              </button>
              <button className="p-1 hover:text-primary-fixed-dim transition-colors" title="Multi-Angle Camera Link Status OK">
                <Video className="w-4 h-4 text-primary-fixed-dim" />
              </button>
            </div>
          </div>
        </header>

        {/* Workstation body */}
        <div className="flex-1 min-h-0">
          {activeTab === 'dashboard' && (
            <DashboardView 
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
              systemSettings={settings}
              onAddSession={handleAddSession}
            />
          )}

          {activeTab === 'feasibility' && (
            <FeasibilityView />
          )}

          {activeTab === 'history' && (
            <HistoryView 
              sessions={sessions}
              patients={patients}
              onDeleteSession={handleDeleteSession}
              onClearAllSessions={handleClearAllSessions}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView 
              patients={patients}
              sessions={sessions}
              onAddPatient={handleAddPatient}
              selectedPatientId={selectedPatient.id}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              settings={settings}
              onSaveSettings={setSettings}
              clinicianInfo={clinician}
              onSaveClinician={setClinician}
            />
          )}
        </div>
      </div>
    </div>
  );
}
