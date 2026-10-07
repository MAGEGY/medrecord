import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { prescriptionService, dispensingService } from '@/utils/data';
import { Prescription } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function DispenseScreen() {
  const navigation = useNavigation(); // Initialize navigation
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || !user) return;
    setScanned(true); // Temporarily disable scanning until navigation occurs or user cancels

    const prescriptionId = data.replace('medrecord://prescription/', '');
    const prescription = await prescriptionService.getById(prescriptionId);
    
    if (prescription) {
      navigation.navigate('PrescriptionDetailsForDispensing', { prescriptionId: prescription.id });
    } else {
      Alert.alert('Prescription Not Found', 'No prescription found for this QR code.', [
        { text: 'Try Again', onPress: () => setScanned(false) }, // Allow re-scan
      ]);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Enter Prescription ID or Patient ID', // Updated prompt
      'Type the ID to look up the prescription',
      async (idInput) => {
        if (!idInput || !user) return;
        
        const trimmedId = idInput.trim();
        let prescription: Prescription | null = null;

        // First, try to find by Prescription ID
        prescription = await prescriptionService.getById(trimmedId);

        if (!prescription) {
          // If not found by prescription ID, try to find by Patient ID
          const patientPrescriptions = await prescriptionService.getByPatientId(trimmedId);
          // Find the latest pending prescription for this patient
          const pendingPrescription = patientPrescriptions
            .filter(p => !p.dispensedAt) // Only pending ones
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Latest first
            [0]; // Get the latest pending one

          if (pendingPrescription) {
            prescription = pendingPrescription;
          }
        }
        
        if (prescription) {
          navigation.navigate('PrescriptionDetailsForDispensing', { prescriptionId: prescription.id });
        } else {
          Alert.alert('Prescription Not Found', 'No prescription found for this ID.');
        }
      }
    );
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
              GRANT PERMISSION
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
              {scanned ? 'Processing...' : 'Scan prescription QR code'}
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
            onPress={handleManualEntry}
          >
            <MaterialCommunityIcons name="keyboard" size={24} color={theme.primary} />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Manual Entry
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
