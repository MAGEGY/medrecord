export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'lab' | 'physiotherapy' | 'radiologist';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  nationalId: string;
  password?: string; // Added for mock authentication purposes
  role: UserRole;
  approvalStatus: ApprovalStatus;
  displayName: string;
  avatarIndex: number;
  biometricEnabled: boolean;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  stockLevel?: number;
  expiryDate?: string;
  interactions?: string[];
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  createdAt: string;
  qrCode: string;
  webLink: string;
  dispensedAt?: string;
  dispensedBy?: string;
  partiallyDispensed?: boolean;
}

export interface PrescriptionMedicine {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispensed?: number;
}

export interface VitalSign {
  id: string;
  patientId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  recordedAt: string;
  recordedBy: string;
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  recordedAt: string;
}

export interface LifestyleData {
  id: string;
  patientId: string;
  date: string;
  steps?: number;
  calories?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

export interface DispensingRecord {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  pharmacistId: string;
  dispensedMedicines: {
    medicineId: string;
    medicineName: string;
    quantityDispensed: number;
    quantityPrescribed: number;
  }[];
  dispensedAt: string;
  partial: boolean;
}
