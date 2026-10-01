# MABRIG VitalIQ

MABRIG VitalIQ is a mobile-first personal health intelligence app for organizing verified readings, visualizing trends, and generating a shareable health summary.

## Safety-first product position

VitalIQ does **not** claim to measure blood glucose, blood pressure, pulse, or oxygen saturation using a phone camera. The MVP accepts readings from manual entry or external measurement devices and records the stated source.

## MVP features

- Blood glucose, blood pressure, pulse, and SpO2 dashboard
- Reading-source provenance
- Local browser persistence
- Seven-reading glucose trend visualization
- Reading history
- Health-summary export
- Responsive mobile-first interface
- Installable web-app manifest
- `/api/health` service health endpoint

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production roadmap

1. Authentication and profiles
2. MongoDB Atlas or Supabase persistence
3. Apple Health / Android Health Connect integrations
4. Supported CGM, glucose meter, blood-pressure cuff, and wearable connectors
5. Permissioned caregiver / clinician sharing
6. PDF reports and date filters
7. Medication and symptom context
8. Audit logs, consent flows, encryption, privacy controls, and jurisdiction-specific compliance review

## Medical disclaimer

This MVP is an informational tracking application, not a diagnostic or treatment tool and not an independently validated medical device.
