import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { prescriptionService, dispensingService } from '@/utils/data';
import { Prescription, PrescriptionMedicine, DispensingRecord } from '@/types';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PharmacistTabParamList } from '@/navigation/PharmacistTabNavigator'; // Assuming this navigator
import { useAuth } from '@/contexts/AuthContext';

type PrescriptionDetailsForDispensingScreenRouteProp = RouteProp<PharmacistTabParamList, 'PrescriptionDetailsForDispensing'>;

export default function PrescriptionDetailsForDispensingScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user: pharmacist } = useAuth();
  const route = useRoute<PrescriptionDetailsForDispensingScreenRouteProp>();
  const { prescriptionId } = route.params;

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispenseQuantities, setDispenseQuantities] = useState<{ [medicineId: string]: string }>({});

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    setLoading(true);
    try {
      const fetchedPrescription = await prescriptionService.getById(prescriptionId);
      setPrescription(fetchedPrescription);
      if (fetchedPrescription) {
        const initialQuantities: { [medicineId: string]: string } = {};
        fetchedPrescription.medicines.forEach(med => {
          initialQuantities[med.medicineId] = String(med.quantity - (med.dispensed || 0));
        });
        setDispenseQuantities(initialQuantities);
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      Alert.alert('Error', 'Failed to load prescription details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseQuantityChange = (medicineId: string, text: string) => {
    setDispenseQuantities(prev => ({ ...prev, [medicineId]: text }));
  };

  const handleDispense = async () => {
    if (!pharmacist || !prescription) {
      Alert.alert('Error', 'Pharmacist not logged in or prescription not found.');
      return;
    }

    const medicinesToDispense: {
      medicineId: string;
      medicineName: string;
      quantityDispensed: number;
      quantityPrescribed: number;
    }[] = [];
    let isPartiallyDispensed = false;

    for (const med of prescription.medicines) {
      const quantityToDispense = parseInt(dispenseQuantities[med.medicineId] || '0');
      const alreadyDispensed = med.dispensed || 0;
      const remainingPrescribed = med.quantity - alreadyDispensed;

      if (quantityToDispense < 0) {
        Alert.alert('Invalid Quantity', `Quantity for ${med.medicineName} cannot be negative.`);
        return;
      }
      if (quantityToDispense > remainingPrescribed) {
        Alert.alert('Invalid Quantity', `Cannot dispense more than remaining prescribed for ${med.medicineName}.`);
        return;
      }

      if (quantityToDispense > 0) {
        medicinesToDispense.push({
          medicineId: med.medicineId,
          medicineName: med.medicineName,
          quantityPrescribed: med.quantity,
          quantityDispensed: quantityToDispense,
        });
      }

      if ((quantityToDispense + alreadyDispensed) < med.quantity) {
        isPartiallyDispensed = true;
      }
    }

    if (medicinesToDispense.length === 0) {
      Alert.alert('No Medicines Selected', 'Please enter quantities for medicines to dispense.');
      return;
    }

    try {
      // Update the prescription in prescriptionService
      await prescriptionService.dispense(prescription.id, pharmacist.displayName, isPartiallyDispensed);
      // Record the dispensing event
      await dispensingService.record({
        prescriptionId: prescription.id,
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        pharmacistId: pharmacist.id,
        dispensedMedicines: medicinesToDispense.map(item => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantityDispensed: item.quantityDispensed,
          quantityPrescribed: item.quantityPrescribed,
        })),
        partial: isPartiallyDispensed,
      });

      // Update the dispensed quantity on the prescription medicines
      const updatedMedicines = prescription.medicines.map(med => {
        const dispensedItem = medicinesToDispense.find(item => item.medicineId === med.medicineId);
        if (dispensedItem) {
          return { ...med, dispensed: (med.dispensed || 0) + dispensedItem.quantityDispensed };
        }
        return med;
      });
      // Directly update the stored prescription to reflect dispensed quantities
      await prescriptionService.updateMedicines(prescription.id, updatedMedicines);


      Alert.alert('Success', 'Medicines dispensed successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error dispensing medicines:', error);
      Alert.alert('Error', 'Failed to dispense medicines.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
          Prescribed: {item.quantity} {item.dispensed ? `(Dispensed: ${item.dispensed})` : ''}
        </ThemedText>
      </View>
      <View style={styles.dispenseInputContainer}>
        <TextInput
          style={[styles.dispenseInput, { backgroundColor: theme.background, color: theme.text }]}
          keyboardType="numeric"
          value={dispenseQuantities[item.medicineId]}
          onChangeText={(text) => handleDispenseQuantityChange(item.medicineId, text)}
          placeholder="0"
          placeholderTextColor={theme.textSecondary}
        />
        <ThemedText style={{ color: theme.textSecondary }}>
          /{item.quantity - (item.dispensed || 0)}
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

  const isFullyDispensed = prescription.medicines.every(med => med.quantity === (med.dispensed || 0));

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backIcon}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.title, { color: theme.text }]}>Dispense Prescription</ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <ThemedText style={[styles.prescriptionId, { color: theme.primary }]}>
            #{prescription.id}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            Patient: {prescription.patientName}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
            Prescribed by: {prescription.doctorName} on {formatDate(prescription.createdAt)}
          </ThemedText>
          {prescription.dispensedAt && (
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
              {prescription.partiallyDispensed ? 'Partially Dispensed' : 'Fully Dispensed'} on: {formatDate(prescription.dispensedAt)}
              {prescription.dispensedBy && ` by ${prescription.dispensedBy}`}
            </ThemedText>
          )}

          <ThemedText style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>
            Medicines to Dispense
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

        {!isFullyDispensed && (
          <Pressable
            style={[styles.dispenseButton, { backgroundColor: theme.primary }]}
            onPress={handleDispense}
          >
            <ThemedText style={[styles.dispenseButtonText, { color: theme.buttonText }]}>
              Dispense Medicines
            </ThemedText>
          </Pressable>
        )}
        {isFullyDispensed && (
          <ThemedText style={[styles.fullyDispensedText, { color: theme.success }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={theme.success} /> This prescription is fully dispensed.
          </ThemedText>
        )}

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
  dispenseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.lg,
  },
  dispenseInput: {
    width: 60,
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    textAlign: 'center',
    marginRight: Spacing.xs,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dispenseButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    margin: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dispenseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullyDispensedText: {
    textAlign: 'center',
    margin: Spacing.xl,
    fontSize: 16,
    fontWeight: 'bold',
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
