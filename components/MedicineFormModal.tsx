import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Medicine } from '@/types';
import { Picker } from '@react-native-picker/picker';

interface MedicineFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id'>, id?: string) => void;
  initialMedicine?: Medicine | null;
}

const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialMedicine,
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [strength, setStrength] = useState('');
  const [stockLevel, setStockLevel] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [interactions, setInteractions] = useState(''); // Comma separated string

  useEffect(() => {
    if (initialMedicine) {
      setName(initialMedicine.name);
      setGenericName(initialMedicine.genericName);
      setManufacturer(initialMedicine.manufacturer);
      setDosageForm(initialMedicine.dosageForm);
      setStrength(initialMedicine.strength);
      setStockLevel(String(initialMedicine.stockLevel || ''));
      setExpiryDate(initialMedicine.expiryDate || '');
      setInteractions((initialMedicine.interactions || []).join(', '));
    } else {
      // Reset form for new medicine
      setName('');
      setGenericName('');
      setManufacturer('');
      setDosageForm('');
      setStrength('');
      setStockLevel('');
      setExpiryDate('');
      setInteractions('');
    }
  }, [initialMedicine]);

  const handleSave = () => {
    if (!name.trim() || !genericName.trim() || !manufacturer.trim() || !strength.trim()) {
      Alert.alert('Missing Info', 'Please fill in all required medicine details (Name, Generic Name, Manufacturer, Strength).');
      return;
    }

    const medicineToSave: Omit<Medicine, 'id'> = {
      name: name.trim(),
      genericName: genericName.trim(),
      manufacturer: manufacturer.trim(),
      dosageForm: dosageForm.trim(),
      strength: strength.trim(),
      stockLevel: stockLevel ? parseInt(stockLevel) : undefined,
      expiryDate: expiryDate.trim() || undefined,
      interactions: interactions.trim() ? interactions.split(',').map(s => s.trim()) : undefined,
    };

    onSave(medicineToSave, initialMedicine?.id);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={[styles.modalView, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
              {initialMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Name (e.g., Aspirin)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Generic Name (e.g., Acetylsalicylic acid)"
              placeholderTextColor={theme.textSecondary}
              value={genericName}
              onChangeText={setGenericName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Manufacturer (e.g., Bayer)"
              placeholderTextColor={theme.textSecondary}
              value={manufacturer}
              onChangeText={setManufacturer}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Strength (e.g., 100mg)"
              placeholderTextColor={theme.textSecondary}
              value={strength}
              onChangeText={setStrength}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Dosage Form (e.g., Tablet, Capsule)"
              placeholderTextColor={theme.textSecondary}
              value={dosageForm}
              onChangeText={setDosageForm}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Stock Level (e.g., 500)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={stockLevel}
              onChangeText={setStockLevel}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Expiry Date (YYYY-MM-DD, Optional)"
              placeholderTextColor={theme.textSecondary}
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              placeholder="Interactions (comma-separated, e.g., Warfarin, Ibuprofen)"
              placeholderTextColor={theme.textSecondary}
              value={interactions}
              onChangeText={setInteractions}
            />
          </ScrollView>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.saveButtonText, { color: theme.buttonText }]}>
              {initialMedicine ? 'Save Changes' : 'Add Medicine'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '100%',
    maxHeight: '90%', // Limit height
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  formScroll: {
    maxHeight: '80%', // Limit scroll height
    marginBottom: Spacing.lg,
  },
  input: {
    height: 50,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  saveButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
