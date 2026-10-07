import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import PatientHomeScreen from '@/screens/patient/PatientHomeScreen';
import MedicationsScreen from '@/screens/patient/MedicationsScreen';
import LifestyleScreen from '@/screens/patient/LifestyleScreen';
import ProfileScreen from '@/screens/shared/ProfileScreen';
import ViewPrescriptionScreen from '@/screens/patient/ViewPrescriptionScreen'; // Import ViewPrescriptionScreen

export type PatientTabParamList = {
  Home: undefined;
  Medications: undefined;
  Lifestyle: undefined;
  Profile: undefined;
  ViewPrescription: { prescriptionId: string }; // Added ViewPrescription
};

const Tab = createBottomTabNavigator<PatientTabParamList>();

export default function PatientTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
        name="Home"
        component={PatientHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: 'Medications',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Lifestyle"
        component={LifestyleScreen}
        options={{
          title: 'Lifestyle',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />
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
      <Tab.Screen // Hidden View Prescription Screen
        name="ViewPrescription"
        component={ViewPrescriptionScreen}
        options={{
          headerShown: false, // ViewPrescriptionScreen handles its own header
          tabBarButton: () => null, // Hide this screen from the tab bar
        }}
      />
    </Tab.Navigator>
  );
}
