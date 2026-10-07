import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { prescriptionService } from '@/utils/data';
import { Prescription, PrescriptionMedicine } from '@/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PatientTabParamList } from '@/navigation/PatientTabNavigator'; // Assuming this navigator

type ViewPrescriptionScreenRouteProp = RouteProp<PatientTabParamList, 'ViewPrescription'>;

export default function ViewPrescriptionScreen({ navigation }: any) {
  const { theme } = useTheme();
  const route = useRoute<ViewPrescriptionScreenRouteProp>();
  const { prescriptionId } = route.params;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    setLoading(true);
    try {
      const fetchedPrescription = await prescriptionService.getById(prescriptionId);
      setPrescription(fetchedPrescription);
    } catch (error) {
      console.error('Error loading prescription:', error);
      Alert.alert('Error', 'Failed to load prescription details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMedicineItem = (item: PrescriptionMedicine, index: number) => (
    <View key={index} style={[styles.medicineItem, { backgroundColor: theme.surface }]}>
      <MaterialCommunityIcons name="pill" size={24} color={theme.primary} />
      <View style={styles.medicineDetails}>
        <ThemedText style={[styles.medicineName, { color: theme.text }]}>
          {item.medicineName}
        </ThemedText>
        <ThemedText style={[styles.medicineDosage, { color: theme.textSecondary }]}>
          {item.dosage} • {item.frequency} for {item.duration}
        </ThemedText>
        <ThemedText style={[styles.medicineQuantity, { color: theme.textSecondary }]}>
          Quantity: {item.quantity} {item.dispensed ? `(Dispensed: ${item.dispensed})` : ''}
        </ThemedText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <MaterialCommunityIcons name="loader" size={32} color={theme.primary} />
        <ThemedText style={{ color: theme.text, marginTop: Spacing.md }}>Loading prescription...</ThemedText>
      </ThemedView>
    );
  }

  if (!prescription) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={{ color: theme.error }}>Prescription not found.</ThemedText>
        <Pressable style={[styles.backButton, { backgroundColor: theme.primary }]} onPress={() => navigation.goBack()}>
          <ThemedText style={[styles.backButtonText, { color: theme.buttonText }]}>Go Back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backIcon}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.title, { color: theme.text }]}>Prescription Details</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <ThemedText style={[styles.prescriptionId, { color: theme.primary }]}>
            #{prescription.id}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            Prescribed by: {prescription.doctorName}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            Date: {formatDate(prescription.createdAt)}
          </ThemedText>
          {prescription.dispensedAt && (
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
              Dispensed on: {formatDate(prescription.dispensedAt)}
              {prescription.dispensedBy && ` by ${prescription.dispensedBy}`}
            </ThemedText>
          )}

          <ThemedText style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>
            Medicines
          </ThemedText>
          {prescription.medicines.map((med, index) => renderMedicineItem(med, index))}

          {prescription.notes && (
            <>
              <ThemedText style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>
                Notes
              </ThemedText>
              <ThemedText style={[styles.notesText, { color: theme.text }]}>
                {prescription.notes}
              </ThemedText>
            </>
          )}
        </View>

        {/* Action buttons could go here, e.g., "Request Refill" */}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backIcon: {
    marginRight: Spacing.md,
    padding: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    margin: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
    ...Shadows.card,
  },
  prescriptionId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  metaText: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  medicineDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  medicineDosage: {
    fontSize: 14,
  },
  medicineQuantity: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
