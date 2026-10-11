import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { User } from '@/types';
import { storage } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'approvalStatus'>) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await storage.getUser();
      setUser(savedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

const mockUsers: User[] = [
  {
    id: 'user-doctor-1',
    username: 'doctor1',
    phoneNumber: '+11234567890',
    nationalId: 'DOC123456',
    password: 'password', // For mock purposes only
    role: 'doctor',
    approvalStatus: 'approved',
    displayName: 'Dr. Alice',
    avatarIndex: 0,
    biometricEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-patient-1',
    username: 'patient1',
    phoneNumber: '+19876543210',
    nationalId: 'PAT654321',
    password: 'password', // For mock purposes only
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'Mr. Bob',
    avatarIndex: 1,
    biometricEnabled: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-pharmacist-1',
    username: 'pharmacist1',
    phoneNumber: '+15551234567',
    nationalId: 'PHA987654',
    password: 'password', // For mock purposes only
    role: 'pharmacist',
    approvalStatus: 'approved',
    displayName: 'Ms. Carol',
    avatarIndex: 2,
    biometricEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

  const login = async (identifier: string, passwordInput: string): Promise<boolean> => {
    const foundUser = mockUsers.find(user =>
      user.username === identifier ||
      user.phoneNumber === identifier ||
      user.nationalId === identifier
    );

    if (foundUser && foundUser.password === passwordInput) {
      // In a real app, you'd fetch the full user data from a backend after successful auth
      await storage.setUser(foundUser);
      setUser(foundUser);
      return true;
    }

    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'approvalStatus'>): Promise<boolean> => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      // Local demo mode: no admin approval flow exists, so self-registered
      // accounts are approved immediately (otherwise they could never sign in).
      approvalStatus: 'approved',
    };

    await storage.setUser(newUser);
    setUser(newUser);
    return true;
  };

  const logout = async () => {
    await storage.removeUser();
    setUser(null);
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access MedRecord',
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  const loginWithBiometric = async (): Promise<boolean> => {
    try {
      const biometricSuccess = await authenticateWithBiometric();
      if (biometricSuccess) {
        const savedUser = await storage.getUser();
        if (savedUser && savedUser.biometricEnabled) {
          setUser(savedUser);
          return true;
        } else {
          console.log('Biometric login failed: No user saved or biometrics not enabled for user.');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Login with biometric error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, authenticateWithBiometric, loginWithBiometric }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
