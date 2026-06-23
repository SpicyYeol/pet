export interface Patient {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Rabbit' | 'Other';
  breed: string;
  age: number; // in years
  weight: number; // in kg
  ownerName: string;
  ownerEmail: string;
  avatarUrl: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  durationSeconds: number;
  avgHeartRate: number;
  avgRespRate: number;
  avgSpO2: number;
  pantingDetected: boolean;
  notes: string;
}

export interface CameraFeed {
  id: string;
  code: string; // e.g. 'CAM_01'
  name: string; // e.g. 'FRONT (RGB)'
  spatialLabel: string; // e.g. 'SPATIAL: X-AXIS / FRONT'
  angleText: string; // e.g. 'ANGLE: FRONT_0.0°'
  correlation: number;
  type: 'RGB' | 'IR';
  active: boolean;
  imageUrl: string;
  modeText?: string;
}

export interface SystemSettings {
  alertHeartRateMax: number;
  alertHeartRateMin: number;
  alertRespRateMax: number;
  alertRespRateMin: number;
  alertSpO2Min: number;
  irOffsetTemp: number;
  sensorFrequency: number;
  soundAlertsEnabled: boolean;
  autoRecordOnAnomalies: boolean;
}
