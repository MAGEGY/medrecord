import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking'; // Import Linking
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import AppHelp from "@/components/AppHelp";
import { navigationRef } from "@/navigation/navigationRef";

const prefix = Linking.createURL('/'); // Example: medrecord://
const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      // PatientMain is a stack screen within RootNavigator
      PatientMain: {
        path: 'patient',
        screens: {
          Medications: 'medications', // PatientTabNavigator's Medications screen
          ViewPrescription: 'rx/:prescriptionId', // Maps to medrecord://patient/rx/:prescriptionId
          // Other screens in PatientTabNavigator can be added here
        },
      },
      // If a user is not authenticated, they might be redirected to Auth flow, 
      // where Login/Register can be configured if deep linking to them directly is desired.
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      // You can add other top-level navigators here if they need deep linking
    },
  },
};


export default function App() {
  return (
  <ErrorBoundary>
    <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <AuthProvider>
              <NavigationContainer ref={navigationRef} linking={linking}>
                <RootNavigator />
              </NavigationContainer>
              <AppHelp />
            </AuthProvider>
            <StatusBar style="auto" />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
  </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
