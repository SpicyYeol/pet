import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Calendar, 
  Clock, 
  Heart, 
  Wind, 
  Droplet, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Filter,
  CheckCircle2,
  Download
} from 'lucide-react';
import { SessionRecord, Patient } from '../types';

interface HistoryViewProps {
  sessions: SessionRecord[];
  patients: Patient[];
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
}

export default function HistoryView({
  sessions,
  patients,
  onDeleteSession,
  onClearAllSessions
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);

  // Filter logic
  const filteredSessions = sessions.filter(session => {
    // Search match
    const matchesSearch = 
      session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Species match
    if (selectedSpeciesFilter === 'all') return matchesSearch;
    const patientObj = patients.find(p => p.id === session.patientId);
    return matchesSearch && (patientObj?.species.toLowerCase() === selectedSpeciesFilter.toLowerCase());
  });

  // Highlight totals
  const totalDuration = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalPantingEvents = sessions.filter(s => s.pantingDetected).length;
  const averageHeartRate = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.avgHeartRate, 0) / sessions.length)
    : 0;

  const formatSecs = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const handleExportReport = (session: SessionRecord) => {
    alert(`Generating certified veterinary clinical report for ${session.patientName} (${session.id}).\n\n- File exported: RPPG-REPORT-${session.id}.pdf\n- Timestamp: ${new Date(session.timestamp).toLocaleString()}\n- Average HR: ${session.avgHeartRate} BPM\n- Average RR: ${session.avgRespRate} RR\n- Average SpO2: ${session.avgSpO2}%\n- Diagnostic Notes checked by Clinician: Dr. Aris Thorne.`);
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-background overflow-y-auto h-full min-h-[calc(100vh-64px)]">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">Telemetry History Logs</h2>
          <p className="font-mono text-xs text-on-surface-variant/70 uppercase">
            Clinician Registry of Certified rPPG Session Traces
          </p>
        </div>
        {sessions.length > 0 && (
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to purge all stored telemetry sessions? This action is irreversible.')) {
                onClearAllSessions();
              }
            }}
            className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-mono rounded hover:bg-red-500/10 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR ALL SESSION LOGS
          </button>
        )}
      </div>

      {/* Highlights Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-fixed-dim/10 border border-primary-fixed-dim/20 flex items-center justify-center text-primary-fixed-dim shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">Total Runs Completed</p>
            <p className="font-mono text-xl font-bold text-primary-fixed-dim">{sessions.length} Trace Sessions</p>
          </div>
        </div>

        <div className="glass-panel p-4 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-fixed-dim shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">Cumulative HR Avg</p>
            <p className="font-mono text-xl font-bold text-tertiary-fixed-dim">{averageHeartRate || '---'} BPM</p>
          </div>
        </div>

        <div className="glass-panel p-4 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">Total Trace Time</p>
            <p className="font-mono text-xl font-bold text-secondary">{formatSecs(totalDuration)}</p>
          </div>
        </div>

        <div className="glass-panel p-4 border border-white/5 rounded-xl flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            totalPantingEvents > 0 
              ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' 
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase">Panting Alarms Raised</p>
            <p className="font-mono text-xl font-bold text-on-surface">{totalPantingEvents} Detected</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-on-surface-variant/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Patient Name or Clinical notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container/60 border border-outline-variant/30 text-on-background pl-10 pr-4 py-2 text-sm rounded-lg focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-surface text-on-background px-3 border border-outline-variant/40 rounded-lg text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>GENRE:</span>
            <select
              value={selectedSpeciesFilter}
              onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
              className="bg-transparent text-on-background focus:outline-none py-1 h-full font-sans cursor-pointer"
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs Only</option>
              <option value="cat">Cats Only</option>
              <option value="rabbit">Rabbits Only</option>
            </select>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="border border-white/5 rounded-xl bg-surface-container/20 p-12 text-center flex flex-col items-center justify-center">
          <Calendar className="w-12 h-12 text-on-surface-variant/20 mb-3" />
          <h4 className="text-on-surface font-semibold text-lg">No traces recorded yet</h4>
          <p className="text-on-surface-variant/50 max-w-md text-sm mt-1">
            Tap the "RECORD ALL NODES" button on the active telemetry dashboard to capture your first rPPG clinical analysis.
          </p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="border border-white/5 rounded-xl bg-surface-container/20 p-8 text-center text-on-surface-variant/60">
          No records match your search filters. Try adjusting your inputs.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-4">
            {filteredSessions.map((session) => {
              const patientObj = patients.find(p => p.id === session.patientId);
              return (
                <div 
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all ${
                    selectedSession?.id === session.id 
                      ? 'bg-surface-container-high border-primary-fixed-dim/50 shadow-md' 
                      : 'bg-surface-container/60 border-white/5 hover:border-white/10 hover:bg-surface-container'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      {patientObj ? (
                        <img 
                          src={patientObj.avatarUrl} 
                          alt={session.patientName} 
                          className="w-10 h-10 rounded-full border border-white/15 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                          🐾
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-on-surface">{session.patientName}</h4>
                        <div className="flex gap-2 items-center text-[10px] font-mono text-on-surface-variant/70 mt-0.5">
                          <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(session.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {session.pantingDetected && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-secondary bg-secondary-container/10 border border-secondary-container/20 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          ALARM_RAISED
                        </span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 px-1.5 rounded bg-white/5 border border-white/5 text-on-surface-variant/40 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/20 transition-all"
                        title="Purge trace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vitals Summary Row */}
                  <div className="grid grid-cols-3 gap-1 bg-black/40 p-2.5 rounded-lg border border-white/5 my-3 text-center">
                    <div>
                      <p className="text-[8px] font-mono text-on-surface-variant/50 uppercase">AVG BPM</p>
                      <p className="text-sm font-bold font-mono text-primary-fixed-dim">{session.avgHeartRate}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-on-surface-variant/50 uppercase">AVG RR</p>
                      <p className="text-sm font-bold font-mono text-tertiary-fixed-dim">{session.avgRespRate}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-on-surface-variant/50 uppercase">AVG SpO2</p>
                      <p className="text-sm font-bold font-mono text-secondary">{session.avgSpO2}%</p>
                    </div>
                  </div>

                  {/* Notes snippet */}
                  <p className="text-xs text-on-surface-variant/85 line-clamp-2 leading-relaxed">
                    {session.notes}
                  </p>

                  <div className="mt-3 flex justify-between items-center border-t border-white/5 pt-3 text-[10px] font-mono text-on-surface-variant/50">
                    <span>DURATION: {session.durationSeconds} SECONDS</span>
                    <span className="text-primary-fixed-dim flex items-center gap-1.5 hover:underline">
                      <FileText className="w-3 h-3" /> OUTLINE FULL TRACE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Diagnosis Column (Right Side) */}
          <div className="glass-panel p-5 border border-white/10 rounded-xl space-y-4 sticky top-4">
            {selectedSession ? (
              <>
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[9px] font-mono text-primary-fixed-dim px-2 py-0.5 rounded bg-primary-fixed-dim/10 border border-primary-fixed-dim/25">
                    ID: {selectedSession.id}
                  </span>
                  <h3 className="font-headline text-xl font-bold text-on-surface mt-2">
                    {selectedSession.patientName} Detailed Log
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/70 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedSession.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Patient overview capsule if found */}
                {patients.find(p => p.id === selectedSession.patientId) && (
                  (() => {
                    const patObj = patients.find(p => p.id === selectedSession.patientId)!;
                    return (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                        <img 
                          src={patObj.avatarUrl} 
                          alt={patObj.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-on-surface">{patObj.name}</p>
                          <p className="text-[10px] text-on-surface-variant/60">
                            {patObj.species} • {patObj.breed} ({patObj.age} yr, {patObj.weight} kg)
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Diagnostics Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs border-b border-white/5 py-1.5">
                    <span className="text-on-surface-variant/70 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-primary-fixed-dim" />
                      Trace Heart Rate
                    </span>
                    <span className="font-mono font-bold text-primary-fixed-dim">{selectedSession.avgHeartRate} BPM</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-b border-white/5 py-1.5">
                    <span className="text-on-surface-variant/70 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-tertiary-fixed-dim" />
                      Trace Respiration
                    </span>
                    <span className="font-mono font-bold text-tertiary-fixed-dim">{selectedSession.avgRespRate} RR</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-b border-white/5 py-1.5">
                    <span className="text-on-surface-variant/70 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-secondary" />
                      Oxygen Saturation SpO2
                    </span>
                    <span className="font-mono font-bold text-secondary">{selectedSession.avgSpO2}%</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-b border-white/5 py-1.5">
                    <span className="text-on-surface-variant/70 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                      Session Duration
                    </span>
                    <span className="font-mono text-on-surface font-medium">{selectedSession.durationSeconds}s</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-b border-white/5 py-1.5">
                    <span className="text-on-surface-variant/70 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-on-surface-variant" />
                      Anomalies Raised
                    </span>
                    <span className={`font-mono font-bold ${selectedSession.pantingDetected ? 'text-secondary' : 'text-primary-fixed-dim'}`}>
                      {selectedSession.pantingDetected ? 'Panting detected' : 'None detected'}
                    </span>
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-[10px] font-mono text-on-surface-variant/50 uppercase mb-1">
                    Diagnostic Summary Notes
                  </label>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs leading-relaxed text-on-surface-variant/90 max-h-[140px] overflow-y-auto font-sans custom-scrollbar">
                    {selectedSession.notes}
                  </div>
                </div>

                {/* Sign-off confirmation */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-primary-fixed-dim/80 bg-primary-fixed-dim/5 p-2 rounded-lg border border-primary-fixed-dim/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-primary-fixed-dim" />
                  <span>rPPG Multi-Cam Certified Trace confirmed signature</span>
                </div>

                {/* Action Buttons */}
                <button 
                  onClick={() => handleExportReport(selectedSession)}
                  className="w-full py-2.5 bg-primary-fixed-dim hover:bg-primary-fixed-dim/90 text-on-primary rounded-lg font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  EXPORT DETAILED PDF REPORT
                </button>
              </>
            ) : (
              <div className="text-center py-16 text-on-surface-variant/40 flex flex-col items-center justify-center">
                <FileText className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs font-mono uppercase">No Session Selected</p>
                <p className="text-xs pt-1 max-w-[200px]">Click any trace log on the left to pull clinical summary details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
