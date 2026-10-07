import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert, FlatList, Modal } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, medicineService, prescriptionService, patientAllergyService } from '@/utils/data';
import { User, Medicine, PrescriptionMedicine, PatientAllergy } from '@/types';
import { useNavigation } from '@react-navigation/native';

interface MedicineFormState extends PrescriptionMedicine {
  tempId: string; // Temporary ID for medicine in the form before saving prescription
  interactions?: string[]; // To display interactions directly in the form
}

export default function CreatePrescriptionScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user: doctor } = useAuth(); // Logged-in doctor
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [availablePatients, setAvailablePatients] = useState<User[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<MedicineFormState[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [patientAllergies, setPatientAllergies] = useState<PatientAllergy[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientAllergies(selectedPatient.id);
    } else {
      setPatientAllergies([]);
    }
  }, [selectedPatient]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const patients = await patientService.getAll();
      setAvailablePatients(patients.filter(p => p.role === 'patient')); // Only show actual patients
      const medicines = await medicineService.getAll();
      setAllMedicines(medicines);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load initial data for prescription.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientAllergies = async (patientId: string) => {
    try {
      const allergies = await patientAllergyService.getByPatientId(patientId);
      setPatientAllergies(allergies);
    } catch (error) {
      console.error('Error loading patient allergies:', error);
    }
  };

  const checkInteractionsAndAllergies = useCallback(() => {
    const warnings: string[] = [];
    const medicineNames = selectedMedicines.map(m => m.medicineName.toLowerCase());

    // Check drug-drug interactions
    selectedMedicines.forEach(med => {
      if (med.interactions && med.interactions.length > 0) {
        med.interactions.forEach(interactionMedName => {
          if (medicineNames.includes(interactionMedName.toLowerCase())) {
            warnings.push(`Warning: ${med.medicineName} interacts with ${interactionMedName}.`);
          }
        });
      }
    });

    // Check drug-allergy interactions
    if (patientAllergies.length > 0) {
      selectedMedicines.forEach(med => {
        patientAllergies.forEach(allergy => {
          if (med.medicineName.toLowerCase().includes(allergy.allergen.toLowerCase())) {
            warnings.push(`Caution: Patient is allergic to ${allergy.allergen}. This prescription includes ${med.medicineName}.`);
          }
        });
      });
    }

    return warnings;
  }, [selectedMedicines, patientAllergies]);

  const handleAddMedicine = (medicine: Medicine) => {
    const newMedicineFormState: MedicineFormState = {
      tempId: Date.now().toString(),
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      interactions: medicine.interactions,
    };
    setSelectedMedicines(prev => [...prev, newMedicineFormState]);
  };

  const handleRemoveMedicine = (tempId: string) => {
    setSelectedMedicines(prev => prev.filter(m => m.tempId !== tempId));
  };

  const handleUpdateMedicineField = (tempId: string, field: keyof PrescriptionMedicine, value: any) => {
    setSelectedMedicines(prev =>
      prev.map(med =>
        med.tempId === tempId ? { ...med, [field]: value } : med
      )
    );
  };

  const handleCreatePrescription = async () => {
    if (!doctor || !selectedPatient) {
      Alert.alert('Error', 'Please select a patient and ensure you are logged in as a doctor.');
      return;
    }
    if (selectedMedicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine to the prescription.');
      return;
    }

    const warnings = checkInteractionsAndAllergies();
    if (warnings.length > 0) {
      Alert.alert(
        'Potential Issues',
        'Review the following before proceeding:\n\n' + warnings.join('\n'),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed Anyway', onPress: () => confirmCreatePrescription(warnings) },
        ]
      );
      return;
    }

    confirmCreatePrescription(warnings);
  };

  const confirmCreatePrescription = async (warnings: string[]) => {
    if (!doctor || !selectedPatient) return;

    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.displayName,
        doctorId: doctor.id,
        doctorName: doctor.displayName,
        medicines: selectedMedicines.map(({ tempId, interactions, ...rest }) => rest), // Remove tempId and interactions
        notes: notes,
      };
      await prescriptionService.create(prescriptionData);
      Alert.alert('Success', 'Prescription created successfully!');
      navigation.goBack(); // Go back to prescriptions list
    } catch (error) {
      console.error('Error creating prescription:', error);
      Alert.alert('Error', 'Failed to create prescription.');
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Feather name="loader" size={32} color={theme.primary} />
        <ThemedText style={{ color: theme.text, marginTop: Spacing.md }}>Loading data...</ThemedText>
      </ThemedView>
    );
  }

  const warnings = checkInteractionsAndAllergies(); // Recalculate for display

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.title, { color: theme.text }]}>Create Prescription</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Select Patient</ThemedText>
          <Pressable
            style={[styles.pickerContainer, { backgroundColor: theme.surface }]}
            onPress={() => setShowPatientPicker(true)}
          >
            <ThemedText style={[styles.pickerText, { color: selectedPatient ? theme.text : theme.textSecondary }]}>
              {selectedPatient ? `${selectedPatient.displayName} (${selectedPatient.id})` : '-- Select Patient --'}
            </ThemedText>
            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>

          {selectedPatient && patientAllergies.length > 0 && (
            <View style={[styles.allergiesBox, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
              <MaterialCommunityIcons name="alert" size={16} color={theme.error} />
              <ThemedText style={[styles.allergiesText, { color: theme.error }]}>
                Patient Allergies: {patientAllergies.map(a => a.allergen).join(', ')}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Medicines</ThemedText>
          <Pressable
            style={[styles.pickerContainer, { backgroundColor: theme.surface }]}
            onPress={() => setShowMedicinePicker(true)}
          >
            <ThemedText style={[styles.pickerText, { color: theme.textSecondary }]}>
              -- Add Medicine --
            </ThemedText>
            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>

          {selectedMedicines.map((med, index) => (
            <View key={med.tempId} style={[styles.medicineEntryCard, { backgroundColor: theme.surface }]}>
              <View style={styles.medicineEntryHeader}>
                <ThemedText style={[styles.medicineEntryName, { color: theme.text }]}>
                  {med.medicineName} ({med.strength})
                </ThemedText>
                <Pressable onPress={() => handleRemoveMedicine(med.tempId)}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
                </Pressable>
              </View>
              <View style={styles.medicineEntryInputs}>
                <TextInput
                  style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="Dosage (e.g., 1 tablet)"
                  placeholderTextColor={theme.textSecondary}
                  value={med.dosage}
                  onChangeText={(text) => handleUpdateMedicineField(med.tempId, 'dosage', text)}
                />
                <TextInput
                  style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="Frequency (e.g., twice daily)"
                  placeholderTextColor={theme.textSecondary}
                  value={med.frequency}
                  onChangeText={(text) => handleUpdateMedicineField(med.tempId, 'frequency', text)}
                />
                <TextInput
                  style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="Duration (e.g., 7 days)"
                  placeholderTextColor={theme.textSecondary}
                  value={med.duration}
                  onChangeText={(text) => handleUpdateMedicineField(med.tempId, 'duration', text)}
                />
                <TextInput
                  style={[styles.smallInput, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="Quantity (e.g., 14)"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={String(med.quantity)}
                  onChangeText={(text) => handleUpdateMedicineField(med.tempId, 'quantity', Number(text))}
                />
              </View>
              {med.interactions && med.interactions.length > 0 && (
                <View style={[styles.interactionsBox, { backgroundColor: theme.warning + '10', borderColor: theme.warning, marginTop: Spacing.md }]}>
                  <MaterialCommunityIcons name="alert" size={16} color={theme.warning} />
                  <ThemedText style={[styles.interactionsText, { color: theme.warning }]}>
                    Interacts with: {med.interactions.join(', ')}
                  </ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {warnings.length > 0 && (
          <View style={[styles.warningContainer, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.error} />
            <View style={styles.warningContent}>
              <ThemedText style={[styles.warningTitle, { color: theme.error }]}>
                Potential Issues Found:
              </ThemedText>
              {warnings.map((warning, index) => (
                <ThemedText key={index} style={[styles.warningText, { color: theme.error }]}>
                  - {warning}
                </ThemedText>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Notes (Optional)</ThemedText>
          <TextInput
            style={[styles.notesInput, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="Add additional notes for the prescription..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Pressable
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={handleCreatePrescription}
        >
          <ThemedText style={[styles.createButtonText, { color: theme.buttonText }]}>
            Create Prescription
          </ThemedText>
        </Pressable>
      </ThemedView>

      {/* Patient Picker Modal */}
      <Modal
        visible={showPatientPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPatientPicker(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Select Patient</ThemedText>
              <Pressable onPress={() => setShowPatientPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            <FlatList
              data={availablePatients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalItem, { backgroundColor: theme.backgroundDefault }]}
                  onPress={() => {
                    setSelectedPatient(item);
                    setShowPatientPicker(false);
                  }}
                >
                  <ThemedText style={[styles.modalItemText, { color: theme.text }]}>
                    {item.displayName} ({item.id})
                  </ThemedText>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Medicine Picker Modal */}
      <Modal
        visible={showMedicinePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicinePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMedicinePicker(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Add Medicine</ThemedText>
              <Pressable onPress={() => setShowMedicinePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            <FlatList
              data={allMedicines}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalItem, { backgroundColor: theme.backgroundDefault }]}
                  onPress={() => {
                    handleAddMedicine(item);
                    setShowMedicinePicker(false);
                  }}
                >
                  <ThemedText style={[styles.modalItemText, { color: theme.text }]}>
                    {item.name} ({item.strength})
                  </ThemedText>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenKeyboardAwareScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    padding: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: Spacing.lg,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalItem: {
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemText: {
    fontSize: 16,
  },
  allergiesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  allergiesText: {
    flex: 1,
    fontSize: 12,
  },
  medicineEntryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  medicineEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  medicineEntryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  medicineEntryInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallInput: {
    width: '48%',
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  interactionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  interactionsText: {
    flex: 1,
    fontSize: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 18,
  },
  notesInput: {
    minHeight: 100,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  createButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
