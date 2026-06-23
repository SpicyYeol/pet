import React, { useState } from 'react';
import { 
  Sliders, 
  Bell, 
  ShieldAlert, 
  Info, 
  Save, 
  User, 
  Cpu, 
  RefreshCw, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  clinicianInfo: { name: string; title: string; avatarUrl: string };
  onSaveClinician: (info: { name: string; title: string; avatarUrl: string }) => void;
}

export default function SettingsView({
  settings,
  onSaveSettings,
  clinicianInfo,
  onSaveClinician
}: SettingsViewProps) {
  // Local duplicate state to modify
  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...settings });
  
  // Clinician profile state
  const [clinName, setClinName] = useState(clinicianInfo.name);
  const [clinTitle, setClinTitle] = useState(clinicianInfo.title);
  const [clinAvatar, setClinAvatar] = useState(clinicianInfo.avatarUrl);

  const handleApplyChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    onSaveClinician({
      name: clinName,
      title: clinTitle,
      avatarUrl: clinAvatar
    });
    alert('System configurations Applied! Calibration parameters propagated to the live HUD.');
  };

  const resetToFactoryDefaults = () => {
    if (confirm('Reset HUD telemetry back to clinic default settings?')) {
      const defaults: SystemSettings = {
        alertHeartRateMax: 140,
        alertHeartRateMin: 60,
        alertRespRateMax: 40,
        alertRespRateMin: 15,
        alertSpO2Min: 95,
        irOffsetTemp: 1.4,
        sensorFrequency: 60,
        soundAlertsEnabled: true,
        autoRecordOnAnomalies: true
      };
      setLocalSettings(defaults);
      onSaveSettings(defaults);
      alert('Restored default parameters.');
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 bg-background overflow-y-auto h-full min-h-[calc(100vh-64px)]">
      
      {/* Settings Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">System Configurations</h2>
          <p className="font-mono text-xs text-on-surface-variant/70 uppercase">
            Alter high-fidelity tracking metrics, offsets, and clinician credentials
          </p>
        </div>
        <button 
          onClick={resetToFactoryDefaults}
          className="px-3.5 py-1.5 rounded border border-white/10 hover:border-white/20 text-xs text-on-surface-variant font-mono bg-white/5"
        >
          RESTORE FACTORY DEFAULTS
        </button>
      </div>

      <form onSubmit={handleApplyChanges} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Emergency Threshold Alarms */}
          <div className="glass-panel p-5 border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <ShieldAlert className="w-5 h-5 text-secondary" />
              <h3 className="font-headline font-semibold text-base text-on-surface">Emergency Threshold Alarms</h3>
            </div>

            <div className="space-y-3.5">
              {/* HR Thresholds */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1.5">
                  HEART RATE ALARM LIMITS (BPM)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/40 block uppercase">Min limit</span>
                    <input 
                      type="number" 
                      value={localSettings.alertHeartRateMin}
                      onChange={(e) => setLocalSettings({...localSettings, alertHeartRateMin: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/40 block uppercase">Max limit</span>
                    <input 
                      type="number" 
                      value={localSettings.alertHeartRateMax}
                      onChange={(e) => setLocalSettings({...localSettings, alertHeartRateMax: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Respiratory rate thresholds */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1.5">
                  RESPIRATORY RATE ALARM LIMITS (RR)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/40 block uppercase">Min limits</span>
                    <input 
                      type="number" 
                      value={localSettings.alertRespRateMin}
                      onChange={(e) => setLocalSettings({...localSettings, alertRespRateMin: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-on-surface-variant/40 block uppercase">Max limits</span>
                    <input 
                      type="number" 
                      value={localSettings.alertRespRateMax}
                      onChange={(e) => setLocalSettings({...localSettings, alertRespRateMax: Number(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Min SpO2 Oxygen sat */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-on-surface-variant/70 uppercase">
                    MINIMUM OXYGEN SATURATION (% SpO2)
                  </label>
                  <span className="font-mono text-xs text-secondary font-bold">{localSettings.alertSpO2Min}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="98" 
                  value={localSettings.alertSpO2Min}
                  onChange={(e) => setLocalSettings({...localSettings, alertSpO2Min: Number(e.target.value)})}
                  className="w-full accent-secondary"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Sensor Node Calibration & Settings */}
          <div className="glass-panel p-5 border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <Cpu className="w-5 h-5 text-primary-fixed-dim" />
              <h3 className="font-headline font-semibold text-base text-on-surface">Sensor & Node Calibration</h3>
            </div>

            <div className="space-y-4">
              {/* Thermal IR temperature offset */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-on-surface-variant/70 uppercase">
                    THERMAL SENSOR TEMP OFFSET (°C)
                  </label>
                  <span className="font-mono text-xs text-primary-fixed-dim font-bold">+{localSettings.irOffsetTemp}°C</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={localSettings.irOffsetTemp}
                  onChange={(e) => setLocalSettings({...localSettings, irOffsetTemp: Number(e.target.value)})}
                  className="w-full accent-primary-fixed-dim"
                />
              </div>

              {/* Sensor frequency index */}
              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1.5">
                  RPPG EMISSION FREQUENCY INDEX (Hz)
                </label>
                <select 
                  value={localSettings.sensorFrequency}
                  onChange={(e) => setLocalSettings({...localSettings, sensorFrequency: Number(e.target.value)})}
                  className="w-full bg-black/40 border border-white/10 text-on-background p-2.5 text-xs rounded focus:outline-none font-mono"
                >
                  <option value="30">30 Hz (Standard Resolution)</option>
                  <option value="60">60 Hz (Preferred - Microvascular Multi-Pulse)</option>
                  <option value="90">90 Hz (Ultra High Temporal Resolution)</option>
                  <option value="120">120 Hz (Research Laboratory Mode)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={localSettings.soundAlertsEnabled}
                    onChange={(e) => setLocalSettings({...localSettings, soundAlertsEnabled: e.target.checked})}
                    className="rounded bg-black/40 border-white/10 focus:ring-primary-fixed-dim text-primary-fixed-dim"
                  />
                  <span className="text-xs text-on-surface-variant/85 font-mono">
                    ENABLE CLINICAL AUDIO WARNING CHIMES
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={localSettings.autoRecordOnAnomalies}
                    onChange={(e) => setLocalSettings({...localSettings, autoRecordOnAnomalies: e.target.checked})}
                    className="rounded bg-black/40 border-white/10 focus:ring-primary-fixed-dim text-primary-fixed-dim"
                  />
                  <span className="text-xs text-on-surface-variant/85 font-mono">
                    AUTO-RECORD INDUCTIONS ON ALARM TRIGGER
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Active Clinician Staff Signature credentials */}
          <div className="glass-panel p-5 border border-white/5 rounded-xl space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <User className="w-5 h-5 text-tertiary-fixed-dim" />
              <h3 className="font-headline font-semibold text-base text-on-surface">Clinician Staff Signature Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1">
                  FULL STAFF NAME
                </label>
                <input 
                  type="text" 
                  value={clinName}
                  onChange={(e) => setClinName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1">
                  OFFICIAL TITLE / ROLE
                </label>
                <input 
                  type="text" 
                  value={clinTitle}
                  onChange={(e) => setClinTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant/70 mb-1">
                  CLINICIAN PHOTO AVATAR URL
                </label>
                <input 
                  type="url" 
                  value={clinAvatar}
                  onChange={(e) => setClinAvatar(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="bg-black/35 p-3 rounded-lg border border-white/5 flex gap-3 items-center">
              <Info className="w-4 h-4 text-tertiary-fixed-dim shrink-0" />
              <p className="text-[10px] font-mono text-on-surface-variant/60 leading-relaxed uppercase">
                THIS STAFF PROFILE SIGNATURE WILL BE AUTOMATICALLY EMBEDDED IN GENERATED METRICS REPORTS AND PDF EXPORT TRACES FOR AUDIT COMPLIANCE.
              </p>
            </div>
          </div>
        </div>

        {/* Form Action save button */}
        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            className="px-6 py-3 rounded-xl bg-primary-fixed-dim hover:bg-primary-fixed-dim/90 text-on-primary font-mono text-xs font-bold uppercase transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            SAVE SYSTEM CONFIGURATIONS
          </button>
        </div>
      </form>
    </div>
  );
}
