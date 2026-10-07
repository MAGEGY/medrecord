import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@medrecord_user',
  PATIENTS: '@medrecord_patients',
  MEDICINES: '@medrecord_medicines',
  PRESCRIPTIONS: '@medrecord_prescriptions',
  VITAL_SIGNS: '@medrecord_vital_signs',
  LIFESTYLE_DATA: '@medrecord_lifestyle',
  DISPENSING_HISTORY: '@medrecord_dispensing',
  PATIENT_ALLERGIES: '@medrecord_patient_allergies', // Added for patient allergies
};

export const storage = {
  async getUser() {
    try {
      const value = await AsyncStorage.getItem(KEYS.USER);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: any) {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async getData<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  },

  async setData(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
    }
  },

  KEYS,
};
