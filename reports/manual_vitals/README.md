# Manual / sensor vitals (external inputs)

SpO₂ and body temperature **cannot be derived from this RGB dataset** — they need
a pulse oximeter / calibrated multi-wavelength imaging (SpO₂) and a thermal/IR
camera (temperature). Drop one JSON per video stem here and the `spo2` /
`temperature` analyzers will pick it up automatically and fold it into the EWS:

```
reports/manual_vitals/<stem>.json
{ "spo2": 97.0, "temp_c": 38.6, "source": "pulse_ox" }
```

Fields are optional — provide whichever your sensor gives. If a stem has no file,
the corresponding analyzer reports `unavailable` and contributes 0 to the EWS.

> The `1.json` / `8.json` files here are **synthetic demo data** (`source:
> "synthetic_demo"`) so the UI slots are visibly exercised. Replace them with real
> sensor readings. Do not treat them as clinical values.
