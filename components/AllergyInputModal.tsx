import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PatientAllergy } from '@/types';

interface AllergyInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveAllergy: (allergy: Omit<PatientAllergy, 'id' | 'patientId' | 'recordedAt'>) => void;
}

const AllergyInputModal: React.FC<AllergyInputModalProps> = ({
  visible,
  onClose,
  onSaveAllergy,
}) => {
  const { theme } = useTheme();
  const [allergen, setAllergen] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<PatientAllergy['severity']>('mild');
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);

  const severityOptions: { label: string; value: PatientAllergy['severity'] }[] = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
  ];

  const handleSave = () => {
    if (!allergen.trim() || !reaction.trim()) {
      Alert.alert('Missing Info', 'Please fill in allergen and reaction.');
      return;
    }
    onSaveAllergy({ allergen, reaction, severity });
    setAllergen('');
    setReaction('');
    setSeverity('mild');
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
              Add New Allergy
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="Allergen (e.g., Penicillin, Peanuts)"
            placeholderTextColor={theme.textSecondary}
            value={allergen}
            onChangeText={setAllergen}
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            placeholder="Reaction (e.g., Rash, Swelling, Anaphylaxis)"
            placeholderTextColor={theme.textSecondary}
            value={reaction}
            onChangeText={setReaction}
          />

          <Pressable
            style={[styles.pickerContainer, { backgroundColor: theme.surface }]}
            onPress={() => setShowSeverityPicker(true)}
          >
            <ThemedText style={[styles.pickerText, { color: theme.text }]}>
              Severity: {severityOptions.find(opt => opt.value === severity)?.label || 'Mild'}
            </ThemedText>
            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.saveButtonText, { color: theme.buttonText }]}>
              Save Allergy
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      {/* Severity Picker Modal */}
      <Modal
        visible={showSeverityPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSeverityPicker(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setShowSeverityPicker(false)}>
          <Pressable style={[styles.pickerModalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.pickerModalHeader}>
              <ThemedText style={[styles.pickerModalTitle, { color: theme.text }]}>Select Severity</ThemedText>
              <Pressable onPress={() => setShowSeverityPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            {severityOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.pickerModalItem,
                  { backgroundColor: severity === option.value ? theme.primary + '20' : theme.backgroundDefault },
                ]}
                onPress={() => {
                  setSeverity(option.value);
                  setShowSeverityPicker(false);
                }}
              >
                <ThemedText style={[styles.pickerModalItemText, { color: theme.text }]}>
                  {option.label}
                </ThemedText>
                {severity === option.value && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.primary} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
    maxHeight: '80%', // Limit height
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
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingBottom: Spacing.xl,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerModalItemText: {
    fontSize: 16,
  },
  saveButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
