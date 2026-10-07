import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import PatientsScreen from '@/screens/doctor/PatientsScreen';
import ScanScreen from '@/screens/doctor/ScanScreen';
import PrescriptionsScreen from '@/screens/doctor/PrescriptionsScreen';
import DatabaseScreen from '@/screens/doctor/DatabaseScreen';
import ProfileScreen from '@/screens/shared/ProfileScreen';
import OCRScannerScreen from '@/screens/ocr/OCRScannerScreen'; // Import OCRScannerScreen
import PatientDetailScreen from '@/screens/doctor/PatientDetailScreen'; // Import PatientDetailScreen
import CreatePrescriptionScreen from '@/screens/doctor/CreatePrescriptionScreen'; // Import CreatePrescriptionScreen

export type DoctorTabParamList = {
  Patients: undefined;
  Scan: undefined;
  Prescriptions: undefined;
  Database: undefined;
  Profile: undefined;
  OCRScanner: { onScan: (text: string) => void };
  PatientDetail: { patientId: string };
  CreatePrescription: undefined; // Added CreatePrescription
};

const Tab = createBottomTabNavigator<DoctorTabParamList>();

export default function DoctorTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Patients"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.backgroundRoot,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen
        name="Patients"
        component={PatientsScreen}
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Prescriptions"
        component={PrescriptionsScreen}
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Database"
        component={DatabaseScreen}
        options={{
          title: 'Database',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="database" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen // Hidden OCR Scanner Screen
        name="OCRScanner"
        component={OCRScannerScreen}
        options={{
          headerShown: false, // OCR screen handles its own header/close button
          tabBarButton: () => null, // Hide this screen from the tab bar
        }}
      />
      <Tab.Screen // Hidden Patient Detail Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{
          headerShown: true, // PatientDetailScreen can have its own header
          tabBarButton: () => null, // Hide this screen from the tab bar
        }}
      />
      <Tab.Screen // Hidden Create Prescription Screen
        name="CreatePrescription"
        component={CreatePrescriptionScreen}
        options={{
          headerShown: false, // CreatePrescriptionScreen handles its own header
          tabBarButton: () => null, // Hide this screen from the tab bar
        }}
      />
    </Tab.Navigator>
  );
}
