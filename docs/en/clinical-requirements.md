# Veterinary Clinical Requirements

*Korean / 한국어: [`docs/ko/clinical-requirements.md`](../ko/clinical-requirements.md)*

The gap list between the current signal-extraction prototype and something
clinically useful, ordered by value.

> ⚠️ **Dataset note**: the dogs are **brachycephalic** (bulldog, French bulldog,
> shih tzu, pug) and an **anesthesia machine** (Dräger/Fabius) is visible — i.e.
> *brachycephalic dogs under anesthesia/recovery*. Their respiratory/airway
> baselines are abnormal and anesthetic risk is high, so **fixed "canine" ranges
> are unsafe**.

## P0 — highest priority

1. **Clinical validation.** Ground truth is only coarse OCR'd monitor HR. Needs
   agreement studies vs synchronized gold standards (ECG, pulse oximeter,
   capnography, continuous temperature): Bland–Altman, per-condition
   sensitivity/specificity, **stratified by species, breed, coat color, size, age**.
   Quantify degradation on dark/long coats and pigmented mucosa.
2. **Species / breed / individual baselines** (replacing fixed thresholds). HR/RR/
   temperature normals differ greatly (cat ≠ dog, puppy ≠ senior, toy ≠ giant,
   sighthound = bradycardic-normal, brachycephalic = higher resting effort).
   Alarm on **deviation from the individual's baseline**. → implemented in
   `petvitals/core/baselines.py` + `reports/patient_profiles/<stem>.json`.
3. **Respiratory quality, not just rate**: effort, pattern, dyspnea, abdominal/
   paradoxical breathing, apnea, **sleeping respiratory rate (SRR — key for cardiac
   patients)**, brachycephalic stertor/stridor. → `petvitals/analyzers/respeffort.py`.

## P1 — clinical basics

| Area | Need | Camera | Status |
|------|------|:---:|------|
| Perfusion — mucous-membrane color (pallor/cyanosis/icterus/injected) | gum/tongue/conjunctiva color | ★★ | ✅ `mucous.py` |
| Perfusion — CRT, blood pressure (NIBP/PTT) | capillary refill, BP proxy | ★ | 🔜 |
| Arrhythmia / rhythm | VPC/AF/AV-block (not just rate). **RSA is normal in dogs** → HRV interpretation is species-specific | ECG needed | 🔜 |
| Pain | validated scales (dog Glasgow CMPS, cat Grimace) — face + posture + behavior | ★★ | 🔜 |
| Consciousness / neuro | mentation (BAR/QAR/obtunded/stupor/coma), seizures, head tilt, tremor, ataxia | ★★ | partial (pose) |
| Weight / hydration | weight trend (cage scale), edema, dehydration | scale ★ | 🔜 |

## P1–P2 — system requirements for "monitoring"

- **Context awareness**: anesthesia/sedation state, drugs, ET tube / IV lines /
  e-collar / bandages / blankets occluding ROIs — without these, numbers are meaningless.
- **Handler/equipment separation + individual ID**; multi-patient cages.
- **Continuous trends + smart alarms**: not 30 s clips but hour-scale capture,
  baseline-deviation alerts, alarm-fatigue management, night IR.
- **Records / regulatory**: EMR integration, audit trail, "not a medical device"
  status, staff escalation.

## Where contactless especially wins (strategy)

- **Stress-free (fear-free) measurement** — especially **cats** (handling causes
  white-coat tachycardia). The biggest differentiator → recommend cat expansion.
- **Home SRR monitoring** for cardiac patients (a validated use).
- **Unattended overnight ICU** surveillance.

## Implementation status (2026-06-23)

| Item | Analyzer | Status |
|------|----------|--------|
| Breed/individual baselines | `core/baselines.py` + `reports/patient_profiles/` | ✅ used by rppg/spo2/temperature |
| Respiratory effort / pattern / apnea | `analyzers/respeffort.py` | ✅ v0 (signal-quality gated) |
| Mucous-membrane color | `analyzers/mucous.py` | ✅ v0 (uncalibrated, low-confidence) |
| HR/RR/HRV/SpO₂/temp/posture/oral | existing analyzers | ✅ |
| CRT / BP / arrhythmia / pain / consciousness / cat | — | 🔜 |

> All thresholds are **configurable defaults, not clinical cutoffs**, and must not
> be used diagnostically before clinical validation.
