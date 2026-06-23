import React from 'react';
import { HeartPulse, Wind, Activity, Bone, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PETVITALS_EWS, EwsPatient } from '../generated/petvitalsEws';

type Patient = EwsPatient;

const SEVERITY_STYLES: Record<string, { ring: string; text: string; bg: string; label: string }> = {
  stable:   { ring: 'border-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'STABLE' },
  watch:    { ring: 'border-amber-500/50',   text: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'WATCH' },
  concern:  { ring: 'border-orange-500/60',  text: 'text-orange-400',  bg: 'bg-orange-500/10',  label: 'CONCERN' },
  critical: { ring: 'border-red-500/70',     text: 'text-red-400',     bg: 'bg-red-500/15',     label: 'CRITICAL' },
};

const Metric: React.FC<{
  icon: React.ElementType; label: string; value: React.ReactNode; unit?: string;
}> = ({ icon: Icon, label, value, unit }) => {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/45">{label}</p>
        <p className="font-sans text-sm text-on-surface">
          {value ?? '—'}{value != null && unit ? <span className="text-on-surface-variant/50 text-xs"> {unit}</span> : null}
        </p>
      </div>
    </div>
  );
};

const PatientCard: React.FC<{ p: Patient }> = ({ p }) => {
  const sev = SEVERITY_STYLES[p.severity] ?? SEVERITY_STYLES.stable;
  const Glyph = p.severity === 'stable' ? ShieldCheck : AlertTriangle;
  return (
    <div className={`rounded-2xl border ${sev.ring} bg-surface/40 p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/45">Patient / clip</p>
          <h3 className="font-headline text-xl font-bold text-on-surface">#{p.stem}</h3>
          <p className="text-[10px] font-mono text-on-surface-variant/40">{p.durationSec}s window</p>
        </div>
        <div className={`flex flex-col items-center justify-center rounded-xl px-4 py-2 ${sev.bg} ${sev.ring} border`}>
          <Glyph className={`w-5 h-5 ${sev.text}`} />
          <span className={`font-mono text-2xl font-bold ${sev.text} leading-none mt-1`}>{p.ews}</span>
          <span className={`font-mono text-[9px] tracking-widest ${sev.text}`}>{sev.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-outline-variant/15 pt-4">
        <Metric icon={HeartPulse} label="Heart rate" value={p.vitals.hrBpm} unit="bpm" />
        <Metric icon={Wind} label="Respiration" value={p.vitals.rrBpm} unit="brpm" />
        <Metric icon={Activity} label="HRV SDNN" value={p.vitals.hrvAvailable ? p.vitals.sdnnMs : null} unit="ms" />
        <Metric icon={Bone} label="Posture" value={p.behavior.topPosture.replace(/_/g, ' ')} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/45">
          Contributions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(p.byAnalyzer).map(([name, score]) => {
            const s = Number(score);
            return (
              <span key={name}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-md border ${
                  s > 0 ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
                        : 'border-outline-variant/20 text-on-surface-variant/45'}`}>
                {name} +{s}
              </span>
            );
          })}
        </div>
        {p.reasons.length > 0 && (
          <ul className="mt-1 space-y-0.5">
            {p.reasons.map((r, i) => (
              <li key={i} className={`text-xs ${sev.text} flex items-start gap-1.5`}>
                <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                <span className="text-on-surface-variant/80">{r}</span>
              </li>
            ))}
          </ul>
        )}
        {p.flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {p.flags.map((f) => (
              <span key={f} className="font-mono text-[9px] px-1.5 py-0.5 rounded text-on-surface-variant/55 bg-white/5">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function EwsView() {
  const data = PETVITALS_EWS;
  const patients = [...data.patients].sort((a, b) => b.ews - a.ews);
  return (
    <div className="p-4 md:p-6 overflow-y-auto h-full">
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Combined Early-Warning Score</h2>
          <p className="text-xs text-on-surface-variant/55 max-w-2xl">
            Behavior (pose) + vitals (HR / RR / HRV) fused per patient by{' '}
            <span className="font-mono text-primary-fixed-dim">petvitals</span>. Higher = more concerning.
            Thresholds are configurable defaults, not clinical cutoffs.
          </p>
        </div>
        <span className="font-mono text-[10px] text-on-surface-variant/40 uppercase tracking-wider">
          analyzers: {data.analyzers.join(' · ')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {patients.map((p) => <PatientCard key={p.stem} p={p} />)}
      </div>
    </div>
  );
}
