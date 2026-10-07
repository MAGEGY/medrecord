import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MedicineSearchModal from '@/components/MedicineSearchModal'; // Import MedicineSearchModal
import AllergyInputModal from '@/components/AllergyInputModal'; // Import AllergyInputModal
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { medicineService } from '@/utils/data';
import { Medicine } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientAllergyService } from '@/utils/data'; // Import patientAllergyService
import { PatientAllergy } from '@/types'; // Import PatientAllergy type

export default function MedicationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false); // This seems unused now. I will remove it later if confirmed.
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [myMedications, setMyMedications] = useState<Medicine[]>([]);
  const [myAllergies, setMyAllergies] = useState<PatientAllergy[]>([]); // New state for patient allergies
  const [loading, setLoading] = useState(true);
  const [showMedicineSearchModal, setShowMedicineSearchModal] = useState(false); // New state for search modal
  const [prescriptionIdInput, setPrescriptionIdInput] = useState(''); // State for manual ID input
  const navigation = useNavigation(); // Import useNavigation

  const handleLookupPrescription = () => {
    if (prescriptionIdInput.trim()) {
      navigation.navigate('ViewPrescription', { prescriptionId: prescriptionIdInput.trim() });
      setPrescriptionIdInput('');
    } else {
      Alert.alert('Missing ID', 'Please enter a prescription ID.');
    }
  };
  const [showAllergyModal, setShowAllergyModal] = useState(false); // New state for allergy modal

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const allMedicines = await medicineService.getAll();
      setMedicines(allMedicines);
      // For a real app, myMedications would be loaded from a patient-specific service
      setMyMedications(allMedicines.slice(0, 3)); 

      if (user) {
        const patientAllergies = await patientAllergyService.getByPatientId(user.id);
        setMyAllergies(patientAllergies);
      }

    } catch (error) {
      console.error('Error loading medications and allergies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    // Add the selected medicine to the patient's medications.
    // In a real app, this would involve saving to a patient-specific medication history service.
    // For mock purposes, we just add it to the local state.
    setMyMedications(prev => {
      if (prev.some(med => med.id === medicine.id)) {
        Alert.alert('Already Added', `${medicine.name} is already in your medication list.`);
        return prev;
      }
      return [...prev, medicine];
    });
    setShowMedicineSearchModal(false);
  };

  const handleSaveAllergy = async (allergy: Omit<PatientAllergy, 'id' | 'patientId' | 'recordedAt'>) => {
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }
    try {
      await patientAllergyService.add({
        ...allergy,
        patientId: user.id,
        recordedAt: new Date().toISOString(),
      });
      loadMedications(); // Reload allergies (and medications) to update the list
      Alert.alert('Success', 'Allergy added successfully!');
    } catch (error) {
      console.error('Error saving allergy:', error);
      Alert.alert('Error', 'Failed to save allergy.');
    }
    setShowAllergyModal(false);
  };

  const addMedication = () => {
    Alert.alert(
      'Add Medication',
      'Choose how to add your medication',
      [
        {
          text: 'Search Database',
          onPress: () => setShowMedicineSearchModal(true),
        },
        {
          text: 'Scan Prescription',
          onPress: () => {
            Alert.alert('OCR', 'OCR scanning feature coming soon');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMedicationCard = ({ item }: { item: Medicine }) => (
    <Pressable
      style={[styles.medicationCard, { backgroundColor: theme.surface }]}
      android_ripple={{ color: theme.primary + '20' }}
    >
      <View style={[styles.medicationIcon, { backgroundColor: theme.primary + '20' }]}>
        <MaterialCommunityIcons name="pill" size={24} color={theme.primary} />
      </View>
      
      <View style={styles.medicationInfo}>
        <ThemedText style={[styles.medicationName, { color: theme.text }]}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.medicationGeneric, { color: theme.textSecondary }]}>
          {item.genericName}
        </ThemedText>
        <View style={styles.medicationMeta}>
          <ThemedText style={[styles.medicationDosage, { color: theme.textSecondary }]}>
            {item.strength} • {item.dosageForm}
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={styles.moreButton}
        onPress={() => Alert.alert(item.name, `${item.genericName}\n${item.strength}\n${item.manufacturer}`)}
      >
        <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.textSecondary} />
      </Pressable>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search medications..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={[styles.allergiesSection, { borderColor: theme.divider }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Allergies</ThemedText>
        {myAllergies.length > 0 ? (
          <View style={styles.allergiesList}>
            {myAllergies.map((allergy) => (
              <View
                key={allergy.id}
                style={[
                  styles.allergyTag,
                  {
                    backgroundColor:
                      allergy.severity === 'severe'
                        ? theme.error + '20'
                        : allergy.severity === 'moderate'
                        ? theme.warning + '20'
                        : theme.success + '20',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color={
                    allergy.severity === 'severe'
                      ? theme.error
                      : allergy.severity === 'moderate'
                      ? theme.warning
                      : theme.success
                  }
                />
                <ThemedText
                  style={[
                    styles.allergyText,
                    {
                      color:
                        allergy.severity === 'severe'
                          ? theme.error
                          : allergy.severity === 'moderate'
                          ? theme.warning
                          : theme.success,
                    },
                  ]}
                >
                  {allergy.allergen}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText style={[styles.noAllergiesText, { color: theme.textSecondary }]}>
            No allergies recorded
          </ThemedText>
        )}
        <Pressable
          style={[styles.addAllergyButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowAllergyModal(true)}
        >
          <MaterialCommunityIcons name="plus-circle" size={20} color={theme.buttonText} />
          <ThemedText style={[styles.addAllergyButtonText, { color: theme.buttonText }]}>
            Add Allergy
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.prescriptionLookupSection, { backgroundColor: theme.surface }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>View Prescription by ID</ThemedText>
        <TextInput
          style={[styles.lookupInput, { backgroundColor: theme.background, color: theme.text }]}
          placeholder="Enter Prescription ID (e.g., RX12345)"
          placeholderTextColor={theme.textSecondary}
          value={prescriptionIdInput}
          onChangeText={setPrescriptionIdInput}
        />
        <Pressable
          style={[styles.lookupButton, { backgroundColor: theme.primary }]}
          onPress={handleLookupPrescription}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={theme.buttonText} />
          <ThemedText style={[styles.lookupButtonText, { color: theme.buttonText }]}>
            Lookup Prescription
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={myMedications}
        renderItem={renderMedicationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing['5xl'] },
        ]}
        refreshing={loading}
        onRefresh={loadMedications}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No medications yet
            </ThemedText>
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={addMedication}
            >
              <ThemedText style={[styles.addButtonText, { color: theme.buttonText }]}>
                ADD MEDICATION
              </ThemedText>
            </Pressable>
          </View>
        }
      />

      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: tabBarHeight + Spacing.xl,
          },
          Shadows.fab,
        ]}
        onPress={addMedication}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <MedicineSearchModal
        visible={showMedicineSearchModal}
        onClose={() => setShowMedicineSearchModal(false)}
        onSelectMedicine={handleSelectMedicine}
      />

      <AllergyInputModal
        visible={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        onSaveAllergy={handleSaveAllergy}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: Spacing.lg,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  medicationGeneric: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  medicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationDosage: {
    fontSize: 12,
  },
  moreButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  addButton: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergiesSection: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  allergyTag: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noAllergiesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  addAllergyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  addAllergyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  prescriptionLookupSection: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: Spacing.lg,
  },
  lookupInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  lookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  lookupButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
