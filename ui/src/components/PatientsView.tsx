import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Dog, 
  Sparkles, 
  TrendingUp, 
  Heart, 
  X,
  PlusCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { Patient, SessionRecord } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  sessions: SessionRecord[];
  onAddPatient: (patient: Patient) => void;
  selectedPatientId: string;
  onSelectPatient: (patient: Patient) => void;
}

export default function PatientsView({
  patients,
  sessions,
  onAddPatient,
  selectedPatientId,
  onSelectPatient
}: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Patient Form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'Dog' | 'Cat' | 'Rabbit' | 'Other'>('Dog');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState<number>(3);
  const [newWeight, setNewWeight] = useState<number>(10);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  // Active viewing profile
  const [activePatient, setActivePatient] = useState<Patient>(
    patients.find(p => p.id === selectedPatientId) || patients[0]
  );

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (p: Patient) => {
    setActivePatient(p);
    onSelectPatient(p);
  };

  const handleSubmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBreed || !newOwnerName) {
      alert('Please fill out all mandatory fields (Name, Breed, and Owner details).');
      return;
    }

    const defaultAvatars: Record<string, string> = {
      Dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      Cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      Rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
      Other: 'https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=400'
    };

    const newPatient: Patient = {
      id: 'P_' + Date.now(),
      name: newName,
      species: newSpecies,
      breed: newBreed,
      age: Number(newAge) || 1,
      weight: Number(newWeight) || 5,
      ownerName: newOwnerName,
      ownerEmail: newOwnerEmail || `${newName.toLowerCase()}@example.com`,
      avatarUrl: newAvatarUrl || defaultAvatars[newSpecies]
    };

    onAddPatient(newPatient);
    setActivePatient(newPatient);
    setShowAddForm(false);

    // Reset fields
    setNewName('');
    setNewBreed('');
    setNewAge(3);
    setNewWeight(10);
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewAvatarUrl('');

    alert(`Successfully registered Patient: ${newPatient.name}. Baseline monitoring parameters synchronized.`);
  };

  // Stats computed for active pet's logs
  const petSessions = sessions.filter(s => s.patientId === activePatient.id);
  const totalPetRuns = petSessions.length;
  const avgPetHr = totalPetRuns > 0 
    ? Math.round(petSessions.reduce((acc, s) => acc + s.avgHeartRate, 0) / totalPetRuns)
    : '---';
  const avgPetRr = totalPetRuns > 0
    ? Math.round(petSessions.reduce((acc, s) => acc + s.avgRespRate, 0) / totalPetRuns)
    : '---';

  return (
    <div className="flex-1 p-4 md:p-6 bg-background overflow-y-auto h-full min-h-[calc(100vh-64px)]">
      
      {/* Upper header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface text-primary-fixed-dim">Clinical Patient Registry</h2>
          <p className="font-mono text-xs text-on-surface-variant/70 uppercase">
            Manage subject physical profiles & microvascular perfusion history
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary-fixed-dim text-on-primary font-mono text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-primary-fixed-dim/80 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          REGISTRATION NEW PATIENT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Search & Profiles List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter by name, breed, species..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container/60 border border-outline-variant/30 text-on-background pl-10 pr-4 py-2 text-sm rounded-lg focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredPatients.map((p) => (
              <div 
                key={p.id}
                onClick={() => handlePatientClick(p)}
                className={`flex gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all items-center ${
                  activePatient.id === p.id 
                    ? 'bg-primary-container/10 border-primary-fixed-dim' 
                    : 'bg-surface-container/60 border-white/5 hover:border-white/10 hover:bg-surface-container'
                }`}
              >
                <img 
                  src={p.avatarUrl} 
                  alt={p.name} 
                  className="w-11 h-11 rounded-full border border-white/10 object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-on-surface truncate">{p.name}</h4>
                    <span className="text-[9px] font-mono text-primary-fixed-dim bg-primary-fixed-dim/10 py-0.5 px-2 rounded">
                      {p.species}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70 truncate">{p.breed} • {p.age} Yrs</p>
                  <p className="text-[10px] font-mono text-on-surface-variant/40 truncate">Owner: {p.ownerName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Active Patient Bio and diagnostic baseline analyses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border border-white/10 rounded-xl">
            
            {/* Upper Bio card */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center border-b border-white/5 pb-5 mb-5 justify-between">
              <div className="flex items-center gap-5">
                <img 
                  src={activePatient.avatarUrl} 
                  alt={activePatient.name} 
                  className="w-20 h-20 rounded-xl border border-white/15 object-cover shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">{activePatient.name}</h3>
                    <span className="text-xs font-mono text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 py-0.5 px-2.5 rounded">
                      ID: {activePatient.id}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant/80 font-sans mt-0.5 font-medium">
                    {activePatient.species} — {activePatient.breed}
                  </p>
                  <p className="text-xs text-on-surface-variant/50 flex items-center gap-2 mt-2 font-mono">
                    <User className="w-3.5 h-3.5 text-primary-fixed-dim" />
                    <span>OWNER: {activePatient.ownerName}</span>
                    <span>•</span>
                    <Mail className="w-3.5 h-3.5 text-primary-fixed-dim" />
                    <span>{activePatient.ownerEmail}</span>
                  </p>
                </div>
              </div>

              {/* Set Active for HUD toggle */}
              <button 
                onClick={() => {
                  onSelectPatient(activePatient);
                  alert(`Target HUD alignment shifted to ${activePatient.name}. Go to Dashboard to inspect the live camera feed.`);
                }}
                className="py-2 px-4 rounded-lg bg-primary-fixed-dim/10 hover:bg-primary-fixed-dim/20 border border-primary-fixed-dim/40 text-primary-fixed-dim font-mono text-xs font-bold tracking-wider"
              >
                SELECT AS HUD TARGET
              </button>
            </div>

            {/* Core physical metrics block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/40 p-3.5 rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-mono text-on-surface-variant/50 uppercase">Subject Age</p>
                <p className="text-lg font-bold font-mono text-on-surface mt-1">{activePatient.age} Years</p>
              </div>
              <div className="bg-black/40 p-3.5 rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-mono text-on-surface-variant/50 uppercase">Subject Weight</p>
                <p className="text-lg font-bold font-mono text-on-surface mt-1">{activePatient.weight} kg</p>
              </div>
              <div className="bg-black/40 p-3.5 rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-mono text-on-surface-variant/50 uppercase">Vitals Run Counts</p>
                <p className="text-lg font-bold font-mono text-primary-fixed-dim mt-1">{totalPetRuns} Sessions</p>
              </div>
            </div>

            {/* Diagnostic Baseline Biometrics */}
            <div className="space-y-4">
              <h4 className="font-headline font-semibold text-lg text-on-surface">Physiological Baseline baselines</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-primary-fixed-dim/15 bg-primary-fixed-dim/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-primary-fixed-dim uppercase font-bold">AVG HEART RATE BASAL</span>
                    <Heart className="w-4 h-4 text-primary-fixed-dim animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-mono text-3xl font-extrabold text-primary-fixed-dim">{avgPetHr}</span>
                    <span className="font-mono text-xs text-on-surface-variant/60">BPM</span>
                  </div>
                  <p className="text-[9px] font-mono text-on-surface-variant/60 mt-1 uppercase">
                    Calculated from the animal's microcapillary perfusion logs
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-tertiary-fixed-dim/15 bg-tertiary-fixed-dim/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-tertiary-fixed-dim uppercase font-bold">AVG RESPIRATORY RATE</span>
                    <TrendingUp className="w-4 h-4 text-tertiary-fixed-dim" />
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="font-mono text-3xl font-extrabold text-tertiary-fixed-dim">{avgPetRr}</span>
                    <span className="font-mono text-xs text-on-surface-variant/60">RR</span>
                  </div>
                  <p className="text-[9px] font-mono text-on-surface-variant/60 mt-1 uppercase">
                    Average trace index calculated without stress modifiers
                  </p>
                </div>
              </div>

              {/* Patient Session Table and notes */}
              <div className="mt-4">
                <h5 className="font-mono text-xs text-on-surface-variant/60 uppercase mb-3 block">
                  Historical Perfusion Traces for {activePatient.name}
                </h5>

                {petSessions.length === 0 ? (
                  <div className="bg-black/25 text-center p-6 border border-white/5 rounded-lg text-xs text-on-surface-variant/40">
                    No diagnostics captured during this shift. Connect {activePatient.name} to the HUD to begin.
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 rounded-lg divide-y divide-white/5 text-xs font-mono">
                    {petSessions.map(s => (
                      <div key={s.id} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-on-surface-variant/40" />
                          <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                          <span className="text-on-surface-variant/30">•</span>
                          <span>{s.durationSeconds}s tracking</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span>HR: <strong className="text-primary-fixed-dim">{s.avgHeartRate}</strong></span>
                          <span>RR: <strong className="text-tertiary-fixed-dim">{s.avgRespRate}</strong></span>
                          <span>SpO2: <strong className="text-secondary">{s.avgSpO2}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-surface-container border border-outline-variant/40 rounded-2xl w-full max-w-lg overflow-hidden custom-scrollbar max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-primary-fixed-dim" />
                <h3 className="font-headline text-lg font-bold text-on-surface-variant">Register New Pet Patient</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded bg-white/5 text-on-surface-variant/50 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPatient} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Subject Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Apollo" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-primary-fixed-dim"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Species *</label>
                  <select 
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-primary-fixed-dim"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Age (Years)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    placeholder="3" 
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Weight (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="24.5" 
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Breed *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Golden Retriever" 
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-mono text-primary-fixed-dim uppercase mb-3">Owner Contact Credentials</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sarah Jenkins" 
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="sarah@example.com" 
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-on-surface-variant/60 mb-1">Avatar Image URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-on-background p-2 text-xs rounded focus:outline-none font-mono"
                />
                <span className="text-[10px] font-mono text-on-surface-variant/40 mt-1 block">
                  Leaves standard placeholder portrait depending on Selected Species.
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono rounded"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary-fixed-dim hover:bg-primary-fixed-dim/90 text-on-primary font-mono text-xs font-bold rounded"
                >
                  REGISTER IN DATABASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
