import { Patient, SessionRecord, CameraFeed, SystemSettings } from './types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P001',
    name: 'Apollo',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 31.5,
    ownerName: 'Chloe Bennett',
    ownerEmail: 'chloe.b@example.com',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkfqEbFPRQX1MQ8fYwmt1DhnVt7G9QtCaxiNkhwCJ87JVTR3M6dOQ_big01jfU0MtRZ1EPd8Uq3eEeEkEPqsTegollprR1oRzz9uYb_6GhD5olbiJpHnlt018o8ylDE-LKTj3XvZxJNJMji2S8i1ppDrqos5s1IdKJ5477inMwkyqyQDaI7xh9eZk6zbWgZ_ssOIwORSRvYqSSsMSz8sVAJV0BKlzVIVUvSV-hA8BFgFELU2KZnya1AmcL1PpbHkBs6bOkXd4UGBS',
  },
  {
    id: 'P002',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    age: 5,
    weight: 4.8,
    ownerName: 'Marcus Foster',
    ownerEmail: 'marcus.foster@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'P003',
    name: 'Barnaby',
    species: 'Rabbit',
    breed: 'Angora',
    age: 2,
    weight: 2.1,
    ownerName: 'Sarah Jenkins',
    ownerEmail: 's.jenkins@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'P004',
    name: 'Luna',
    species: 'Dog',
    breed: 'Siberian Husky',
    age: 4,
    weight: 24.2,
    ownerName: 'David Kim',
    ownerEmail: 'david.k@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=400',
  }
];

export const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: 'S101',
    patientId: 'P001',
    patientName: 'Apollo',
    timestamp: '2026-05-24T09:15:00Z',
    durationSeconds: 300,
    avgHeartRate: 121,
    avgRespRate: 24,
    avgSpO2: 98,
    pantingDetected: true,
    notes: 'Anesthesia induction monitoring. Mild respiratory panting observed during transient body temperature elevation (+1.4°C).'
  },
  {
    id: 'S102',
    patientId: 'P002',
    patientName: 'Whiskers',
    timestamp: '2026-05-23T14:22:12Z',
    durationSeconds: 180,
    avgHeartRate: 142,
    avgRespRate: 29,
    avgSpO2: 99,
    pantingDetected: false,
    notes: 'Routine cardiovascular compliance baseline. Dynamic rPPG readings verified through cheek-capillary perfusion.'
  },
  {
    id: 'S103',
    patientId: 'P003',
    patientName: 'Barnaby',
    timestamp: '2026-05-22T10:05:44Z',
    durationSeconds: 420,
    avgHeartRate: 205,
    avgRespRate: 52,
    avgSpO2: 97,
    pantingDetected: false,
    notes: 'Pre-surgery baseline vitals check. Subject stable; slightly anxious causing higher respiration rates.'
  }
];

export const INITIAL_FEEDS: CameraFeed[] = [
  {
    id: 'feed_1',
    code: 'CAM_01',
    name: 'FRONT (RGB)',
    spatialLabel: 'SPATIAL: X-AXIS / FRONT',
    angleText: 'ANGLE: FRONT_0.0°',
    correlation: 0.98,
    type: 'RGB',
    active: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkfqEbFPRQX1MQ8fYwmt1DhnVt7G9QtCaxiNkhwCJ87JVTR3M6dOQ_big01jfU0MtRZ1EPd8Uq3eEeEkEPqsTegollprR1oRzz9uYb_6GhD5olbiJpHnlt018o8ylDE-LKTj3XvZxJNJMji2S8i1ppDrqos5s1IdKJ5477inMwkyqyQDaI7xh9eZk6zbWgZ_ssOIwORSRvYqSSsMSz8sVAJV0BKlzVIVUvSV-hA8BFgFELU2KZnya1AmcL1PpbHkBs6bOkXd4UGBS'
  },
  {
    id: 'feed_2',
    code: 'CAM_02',
    name: 'SIDE (RGB)',
    spatialLabel: 'SPATIAL: Y-AXIS / SIDE_L',
    angleText: 'ANGLE: SIDE_90.0°',
    correlation: 0.94,
    type: 'RGB',
    active: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkfqEbFPRQX1MQ8fYwmt1DhnVt7G9QtCaxiNkhwCJ87JVTR3M6dOQ_big01jfU0MtRZ1EPd8Uq3eEeEkEPqsTegollprR1oRzz9uYb_6GhD5olbiJpHnlt018o8ylDE-LKTj3XvZxJNJMji2S8i1ppDrqos5s1IdKJ5477inMwkyqyQDaI7xh9eZk6zbWgZ_ssOIwORSRvYqSSsMSz8sVAJV0BKlzVIVUvSV-hA8BFgFELU2KZnya1AmcL1PpbHkBs6bOkXd4UGBS'
  },
  {
    id: 'feed_3',
    code: 'CAM_03',
    name: 'TOP (RGB)',
    spatialLabel: 'SPATIAL: Z-AXIS / PLAN',
    angleText: 'ANGLE: PLAN_TOP',
    correlation: 0.97,
    type: 'RGB',
    active: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkfqEbFPRQX1MQ8fYwmt1DhnVt7G9QtCaxiNkhwCJ87JVTR3M6dOQ_big01jfU0MtRZ1EPd8Uq3eEeEkEPqsTegollprR1oRzz9uYb_6GhD5olbiJpHnlt018o8ylDE-LKTj3XvZxJNJMji2S8i1ppDrqos5s1IdKJ5477inMwkyqyQDaI7xh9eZk6zbWgZ_ssOIwORSRvYqSSsMSz8sVAJV0BKlzVIVUvSV-hA8BFgFELU2KZnya1AmcL1PpbHkBs6bOkXd4UGBS'
  },
  {
    id: 'feed_4',
    code: 'CAM_04',
    name: 'MODE: INFRARED',
    spatialLabel: 'CAM_04: ISOMETRIC / REAR',
    angleText: 'MODE: THERMAL_MAP',
    correlation: 0.91,
    type: 'IR',
    active: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkfqEbFPRQX1MQ8fYwmt1DhnVt7G9QtCaxiNkhwCJ87JVTR3M6dOQ_big01jfU0MtRZ1EPd8Uq3eEeEkEPqsTegollprR1oRzz9uYb_6GhD5olbiJpHnlt018o8ylDE-LKTj3XvZxJNJMji2S8i1ppDrqos5s1IdKJ5477inMwkyqyQDaI7xh9eZk6zbWgZ_ssOIwORSRvYqSSsMSz8sVAJV0BKlzVIVUvSV-hA8BFgFELU2KZnya1AmcL1PpbHkBs6bOkXd4UGBS',
    modeText: 'THERMAL_MAP'
  }
];

export const DEFAULT_SETTINGS: SystemSettings = {
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
