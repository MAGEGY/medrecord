import { Medicine, Prescription, VitalSign, PatientAllergy, LifestyleData, DispensingRecord, User } from '@/types';
import { storage } from './storage';

const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Aspirin', genericName: 'Acetylsalicylic acid', manufacturer: 'Bayer', dosageForm: 'Tablet', strength: '100mg', stockLevel: 500, interactions: ['Warfarin', 'Ibuprofen'] },
  { id: '2', name: 'Lisinopril', genericName: 'Lisinopril', manufacturer: 'Merck', dosageForm: 'Tablet', strength: '10mg', stockLevel: 300, interactions: ['Potassium supplements'] },
  { id: '3', name: 'Metformin', genericName: 'Metformin HCl', manufacturer: 'Teva', dosageForm: 'Tablet', strength: '500mg', stockLevel: 450, interactions: ['Alcohol'] },
  { id: '4', name: 'Amoxicillin', genericName: 'Amoxicillin', manufacturer: 'GSK', dosageForm: 'Capsule', strength: '250mg', stockLevel: 200, interactions: ['Warfarin'] },
  { id: '5', name: 'Atorvastatin', genericName: 'Atorvastatin', manufacturer: 'Pfizer', dosageForm: 'Tablet', strength: '20mg', stockLevel: 350, interactions: ['Grapefruit juice'] },
  { id: '6', name: 'Omeprazole', genericName: 'Omeprazole', manufacturer: 'AstraZeneca', dosageForm: 'Capsule', strength: '20mg', stockLevel: 400 },
  { id: '7', name: 'Levothyroxine', genericName: 'Levothyroxine sodium', manufacturer: 'Abbott', dosageForm: 'Tablet', strength: '50mcg', stockLevel: 250 },
  { id: '8', name: 'Albuterol', genericName: 'Albuterol sulfate', manufacturer: 'GSK', dosageForm: 'Inhaler', strength: '90mcg', stockLevel: 100 },
];

const MOCK_PATIENTS: User[] = [
  {
    id: 'P001',
    username: 'john_doe',
    phoneNumber: '+1234567890',
    nationalId: 'ID12345',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'John Doe',
    avatarIndex: 0,
    biometricEnabled: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'P002',
    username: 'jane_smith',
    phoneNumber: '+1234567891',
    nationalId: 'ID12346',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'Jane Smith',
    avatarIndex: 1,
    biometricEnabled: true,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'P003',
    username: 'bob_johnson',
    phoneNumber: '+1234567892',
    nationalId: 'ID12347',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'Bob Johnson',
    avatarIndex: 2,
    biometricEnabled: false,
    createdAt: '2024-03-10T09:15:00Z',
  },
];

export const medicineService = {
  async getAll(): Promise<Medicine[]> {
    const stored = await storage.getData<Medicine[]>(storage.KEYS.MEDICINES);
    return stored || MOCK_MEDICINES;
  },

  async search(query: string): Promise<Medicine[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.genericName.toLowerCase().includes(lowerQuery)
    );
  },

  async getById(id: string): Promise<Medicine | null> {
    const all = await this.getAll();
    return all.find(m => m.id === id) || null;
  },

  async add(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    const all = await this.getAll();
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.MEDICINES, [...all, newMedicine]);
    return newMedicine;
  },

  async update(id: string, updates: Partial<Medicine>): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(m => m.id === id ? { ...m, ...updates } : m);
    await storage.setData(storage.KEYS.MEDICINES, updated);
  },
};

export const patientService = {
  async getAll(): Promise<User[]> {
    const stored = await storage.getData<User[]>(storage.KEYS.PATIENTS);
    return stored || MOCK_PATIENTS;
  },

  async search(query: string): Promise<User[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(p => 
      p.displayName.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery) ||
      p.phoneNumber.includes(query)
    );
  },

  async getById(id: string): Promise<User | null> {
    const all = await this.getAll();
    return all.find(p => p.id === id) || null;
  },
};

export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    const stored = await storage.getData<Prescription[]>(storage.KEYS.PRESCRIPTIONS);
    return stored || [];
  },

  async getByPatientId(patientId: string): Promise<Prescription[]> {
    const all = await this.getAll();
    return all.filter(p => p.patientId === patientId);
  },

  async create(prescription: Omit<Prescription, 'id' | 'createdAt' | 'qrCode' | 'webLink'>): Promise<Prescription> {
    const all = await this.getAll();
    const id = 'RX' + Date.now();
    const newPrescription: Prescription = {
      ...prescription,
      id,
      createdAt: new Date().toISOString(),
      qrCode: `medrecord://prescription/${id}`,
      webLink: `https://magegy.github.io/medrecord/`,
    };
    await storage.setData(storage.KEYS.PRESCRIPTIONS, [...all, newPrescription]);
    return newPrescription;
  },

  async getById(id: string): Promise<Prescription | null> {
    const all = await this.getAll();
    return all.find(p => p.id === id) || null;
  },

  async dispense(id: string, dispensedBy: string, partial: boolean): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(p => 
      p.id === id 
        ? { 
            ...p, 
            dispensedAt: new Date().toISOString(), 
            dispensedBy,
            partiallyDispensed: partial 
          } 
        : p
    );
    await storage.setData(storage.KEYS.PRESCRIPTIONS, updated);
  },

  async updateMedicines(prescriptionId: string, medicines: PrescriptionMedicine[]): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(p => 
      p.id === prescriptionId 
        ? { ...p, medicines: medicines } 
        : p
    );
    await storage.setData(storage.KEYS.PRESCRIPTIONS, updated);
  },
};

export const vitalSignsService = {
  async getByPatientId(patientId: string): Promise<VitalSign[]> {
    const stored = await storage.getData<VitalSign[]>(storage.KEYS.VITAL_SIGNS);
    return (stored || []).filter(v => v.patientId === patientId);
  },

  async add(vitalSign: Omit<VitalSign, 'id'>): Promise<VitalSign> {
    const stored = await storage.getData<VitalSign[]>(storage.KEYS.VITAL_SIGNS) || [];
    const newVital: VitalSign = {
      ...vitalSign,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.VITAL_SIGNS, [...stored, newVital]);
    return newVital;
  },
};

export const patientAllergyService = {
  async getAll(): Promise<PatientAllergy[]> {
    const stored = await storage.getData<PatientAllergy[]>(storage.KEYS.PATIENT_ALLERGIES);
    return stored || [];
  },

  async getByPatientId(patientId: string): Promise<PatientAllergy[]> {
    const all = await this.getAll();
    return all.filter(a => a.patientId === patientId);
  },

  async add(allergy: Omit<PatientAllergy, 'id'>): Promise<PatientAllergy> {
    const all = await this.getAll();
    const newAllergy: PatientAllergy = {
      ...allergy,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.PATIENT_ALLERGIES, [...all, newAllergy]);
    return newAllergy;
  },
};

export const lifestyleService = {
  async getByPatientId(patientId: string): Promise<LifestyleData[]> {
    const stored = await storage.getData<LifestyleData[]>(storage.KEYS.LIFESTYLE_DATA);
    return (stored || []).filter(l => l.patientId === patientId);
  },

  async add(data: Omit<LifestyleData, 'id'>): Promise<LifestyleData> {
    const stored = await storage.getData<LifestyleData[]>(storage.KEYS.LIFESTYLE_DATA) || [];
    const newData: LifestyleData = {
      ...data,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.LIFESTYLE_DATA, [...stored, newData]);
    return newData;
  },
};

export const dispensingService = {
  async getAll(): Promise<DispensingRecord[]> {
    const stored = await storage.getData<DispensingRecord[]>(storage.KEYS.DISPENSING_HISTORY);
    return stored || [];
  },

  async record(record: Omit<DispensingRecord, 'id' | 'dispensedAt'>): Promise<DispensingRecord> {
    const stored = await this.getAll();
    const newRecord: DispensingRecord = {
      ...record,
      id: Date.now().toString(),
      dispensedAt: new Date().toISOString(),
    };
    await storage.setData(storage.KEYS.DISPENSING_HISTORY, [...stored, newRecord]);
    return newRecord;
  },
};

export const MEDICAL_ADVICE = [
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily to maintain proper hydration and support bodily functions.',
    icon: 'water',
    conditions: [], // General advice
    culturalContext: ['general'],
  },
  {
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate exercise most days of the week to maintain cardiovascular health.',
    icon: 'run',
    conditions: [],
    culturalContext: ['general'],
  },
  {
    title: 'Healthy Diet',
    description: 'Eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.',
    icon: 'food-apple',
    conditions: [],
    culturalContext: ['general'],
  },
  {
    title: 'Adequate Sleep',
    description: 'Get 7-9 hours of quality sleep each night to support immune function and mental health.',
    icon: 'sleep',
    conditions: [],
    culturalContext: ['general'],
  },
  {
    title: 'Stress Management',
    description: 'Practice relaxation techniques like meditation, deep breathing, or yoga to reduce stress.',
    icon: 'meditation',
    conditions: [],
    culturalContext: ['general'],
  },
  {
    title: 'Regular Check-ups',
    description: 'Schedule annual health screenings and follow up with your healthcare provider regularly.',
    icon: 'clipboard-pulse',
    conditions: [],
    culturalContext: ['general'],
  },
  // --- Condition-specific advice ---
  {
    title: 'Manage Blood Pressure',
    description: 'If you have hypertension, monitor your blood pressure regularly and follow your doctor\'s recommendations for diet and medication.',
    icon: 'heart-pulse',
    conditions: ['hypertension'],
    culturalContext: ['general'],
  },
  {
    title: 'Balanced Meals for Diabetes',
    description: 'Focus on consistent meal times, portion control, and choosing low glycemic index foods to manage blood sugar.',
    icon: 'sugar-cube-outline',
    conditions: ['diabetes'],
    culturalContext: ['general'],
  },
  // --- Culturally-tailored advice (examples) ---
  {
    title: 'Mediterranean Diet Benefits',
    description: 'Incorporate olive oil, nuts, seeds, fruits, vegetables, and fish for heart health, common in Mediterranean cultures.',
    icon: 'food-olive',
    conditions: ['heart disease'],
    culturalContext: ['mediterranean'],
  },
  {
    title: 'Traditional Herbal Remedies',
    description: 'Consult with your healthcare provider before combining traditional herbal remedies with prescribed medications.',
    icon: 'leaf',
    conditions: [],
    culturalContext: ['asian', 'african', 'indigenous'],
  },
];
