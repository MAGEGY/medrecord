import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Alert, Linking } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { patientService } from '@/utils/data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

export default function ScanScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    const patientId = data.replace('medrecord://patient/', '');
    const patient = await patientService.getById(patientId);
    
    if (patient) {
      // Navigate to PatientDetail screen
      navigation.navigate('PatientDetail' as never, { patientId: patient.id } as never);
      setScanned(false); // Reset after navigation
    } else {
      Alert.alert('Error', 'Patient not found', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleManualEntry = async () => {
    if (!manualId.trim()) {
      Alert.alert('Error', 'Please enter a patient ID');
      return;
    }

    const patient = await patientService.getById(manualId.trim());
    
    if (patient) {
      Alert.alert(
        'Patient Found',
        `${patient.displayName}\nID: ${patient.id}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Patient not found');
    }
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="camera-off" size={64} color={theme.textSecondary} />
          <ThemedText style={[styles.permissionText, { color: theme.text }]}>
            Camera permission denied
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermission}
          >
            <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
              Grant Permission
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.cameraContainer, { marginBottom: tabBarHeight }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={[styles.scanArea, { borderColor: theme.primary }]} />
          
          <View style={[styles.instructionBox, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.primary} />
            <ThemedText style={[styles.instructionText, { color: theme.text }]}>
              {scanned ? 'Processing...' : 'Align QR code within frame'}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.bottomActions, { bottom: tabBarHeight + Spacing.xl }]}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={() => setScanned(false)}
          >
            <MaterialCommunityIcons name="refresh" size={24} color={theme.primary} />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Reset
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={() => Alert.alert('Manual Entry', 'Enter patient ID manually', [
              { text: 'Cancel' },
              {
                text: 'Enter',
                onPress: () => {
                  Alert.prompt('Patient ID', 'Enter the patient ID:', [
                    { text: 'Cancel' },
                    { text: 'Submit', onPress: handleManualEntry },
                  ]);
                },
              },
            ])}
          >
            <MaterialCommunityIcons name="keyboard" size={24} color={theme.primary} />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Manual
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionText: {
    fontSize: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  button: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing['3xl'],
    gap: Spacing.md,
  },
  instructionText: {
    fontSize: 14,
  },
  bottomActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
