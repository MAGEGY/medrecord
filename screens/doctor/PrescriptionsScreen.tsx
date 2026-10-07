import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import QRCodeGenerator from '@/components/QRCodeGenerator'; // Import QRCodeGenerator
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { prescriptionService } from '@/utils/data';
import { Prescription } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

export default function PrescriptionsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false); // State to control QR code modal visibility
  const [selectedPrescriptionForQr, setSelectedPrescriptionForQr] = useState<Prescription | null>(null); // State to hold the prescription for QR code display

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await prescriptionService.getAll();
      const myPrescriptions = data.filter(p => p.doctorId === user?.id);
      setPrescriptions(myPrescriptions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const sendViaSMS = (prescription: Prescription) => {
    Alert.alert(
      'Send Prescription',
      `Send prescription link to ${prescription.patientName} via SMS?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // In a real application, this would call a backend service
            // that uses Twilio (or similar) to send the SMS with the webLink.
            Alert.alert(
              'Success', 
              `Prescription link sent to ${prescription.patientName} via SMS:\n${prescription.webLink}`
            );
          },
        },
      ]
    );
  };

  const renderPrescriptionCard = ({ item }: { item: Prescription }) => (
    <Pressable
      style={[styles.prescriptionCard, { backgroundColor: theme.surface }]}
      onPress={() => {
        Alert.alert(
          item.id,
          `Patient: ${item.patientName}\nMedicines: ${item.medicines.length}\nStatus: ${item.dispensedAt ? 'Dispensed' : 'Pending'}`,
          [
            { text: 'OK' },
            { text: 'Send SMS', onPress: () => sendViaSMS(item) },
            { text: 'View QR Code', onPress: () => {
              setSelectedPrescriptionForQr(item);
              setShowQrCodeModal(true);
            }},
          ]
        );
      }}
      android_ripple={{ color: theme.primary + '20' }}
    >
      <View style={styles.prescriptionHeader}>
        <View style={styles.prescriptionInfo}>
          <ThemedText style={[styles.prescriptionId, { color: theme.primary }]}>
            {item.id}
          </ThemedText>
          <ThemedText style={[styles.patientName, { color: theme.text }]}>
            {item.patientName}
          </ThemedText>
          <ThemedText style={[styles.prescriptionDate, { color: theme.textSecondary }]}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
        
        {item.dispensedAt ? (
          <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.success} />
            <ThemedText style={[styles.statusText, { color: theme.success }]}>
              Dispensed
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: theme.warning + '20' }]}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.warning} />
            <ThemedText style={[styles.statusText, { color: theme.warning }]}>
              Pending
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.medicinesList}>
        {item.medicines.slice(0, 2).map((med, index) => (
          <View key={index} style={styles.medicineItem}>
            <MaterialCommunityIcons name="pill" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.medicineName, { color: theme.text }]}>
              {med.medicineName}
            </ThemedText>
          </View>
        ))}
        {item.medicines.length > 2 && (
          <ThemedText style={[styles.moreText, { color: theme.textSecondary }]}>
            +{item.medicines.length - 2} more
          </ThemedText>
        )}
      </View>

      <Pressable
        style={[styles.smsButton, { backgroundColor: theme.primary }]}
        onPress={() => sendViaSMS(item)}
      >
        <MaterialCommunityIcons name="message-text" size={18} color={theme.buttonText} />
        <ThemedText style={[styles.smsButtonText, { color: theme.buttonText }]}>
          Send SMS
        </ThemedText>
      </Pressable>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={prescriptions}
        renderItem={renderPrescriptionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshing={loading}
        onRefresh={loadPrescriptions}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No prescriptions yet
            </ThemedText>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showQrCodeModal}
        onRequestClose={() => {
          setShowQrCodeModal(!showQrCodeModal);
          setSelectedPrescriptionForQr(null);
        }}
      >
        <ThemedView style={styles.centeredView}>
          <ThemedView style={[styles.modalView, { backgroundColor: theme.surface }]}>
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
              Prescription QR Code
            </ThemedText>
            {selectedPrescriptionForQr && (
              <QRCodeGenerator value={selectedPrescriptionForQr.qrCode} size={250} />
            )}
            <Pressable
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setShowQrCodeModal(!showQrCodeModal);
                setSelectedPrescriptionForQr(null);
              }}
            >
              <ThemedText style={[styles.modalButtonText, { color: theme.buttonText }]}>
                Close
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('CreatePrescription')}
      >
        <MaterialCommunityIcons name="plus" size={30} color={theme.buttonText} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  prescriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionId: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  prescriptionDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  medicinesList: {
    marginBottom: Spacing.md,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  medicineName: {
    fontSize: 14,
  },
  moreText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    marginLeft: Spacing['2xl'],
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  smsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.xl,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: Spacing['3xl'],
    borderRadius: BorderRadius.lg,
    padding: Spacing['3xl'],
    alignItems: 'center',
    ...Shadows.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  modalButton: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    elevation: 2,
    marginTop: Spacing.xl,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl + tabBarHeight, // Adjust for tab bar height
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.fab, // Custom shadow for FAB
  },
});

