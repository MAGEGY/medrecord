import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { LifestyleData } from '@/types';

type LifestyleField = 'steps' | 'calories' | 'bloodPressure';

interface LifestyleInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<LifestyleData, 'id' | 'patientId' | 'date'>) => void;
  initialField?: LifestyleField;
}

const LifestyleInputModal: React.FC<LifestyleInputModalProps> = ({
  visible,
  onClose,
  onSave,
  initialField,
}) => {
  const { theme } = useTheme();
  const [steps, setSteps] = useState('');
  const [calories, setCalories] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [activeField, setActiveField] = useState<LifestyleField | null>(initialField || null);

  useEffect(() => {
    setActiveField(initialField || null);
  }, [initialField]);

  const handleSave = () => {
    const data: Omit<LifestyleData, 'id' | 'patientId' | 'date'> = {};

    if (steps.trim()) data.steps = parseInt(steps);
    if (calories.trim()) data.calories = parseInt(calories);
    if (bloodPressureSystolic.trim() && bloodPressureDiastolic.trim()) {
      data.bloodPressureSystolic = parseInt(bloodPressureSystolic);
      data.bloodPressureDiastolic = parseInt(bloodPressureDiastolic);
    }

    if (Object.keys(data).length === 0) {
      Alert.alert('No Data', 'Please enter at least one value to save.');
      return;
    }
    
    onSave(data);
    setSteps('');
    setCalories('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setActiveField(null);
    onClose();
  };

  const InputField = ({ label, value, onChangeText, keyboardType = 'default', placeholder, iconName, unit }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'numeric' | 'default';
    placeholder: string;
    iconName: string;
    unit?: string;
  }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
        <MaterialCommunityIcons name={iconName} size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
        {unit && <ThemedText style={[styles.inputUnit, { color: theme.textSecondary }]}>{unit}</ThemedText>}
      </View>
    </View>
  );

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
              Record Lifestyle Data
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.formScroll}>
            <InputField
              label="Steps"
              value={steps}
              onChangeText={setSteps}
              keyboardType="numeric"
              placeholder="e.g., 7500"
              iconName="shoe-sneaker"
            />
            <InputField
              label="Calories Burned"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholder="e.g., 500"
              iconName="fire"
              unit="kcal"
            />
            <View style={styles.bpInputsContainer}>
              <InputField
                label="Systolic BP"
                value={bloodPressureSystolic}
                onChangeText={setBloodPressureSystolic}
                keyboardType="numeric"
                placeholder="e.g., 120"
                iconName="heart-pulse"
                unit="mmHg"
              />
              <InputField
                label="Diastolic BP"
                value={bloodPressureDiastolic}
                onChangeText={setBloodPressureDiastolic}
                keyboardType="numeric"
                placeholder="e.g., 80"
                iconName="heart-pulse"
                unit="mmHg"
              />
            </View>
          </ScrollView>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={[styles.saveButtonText, { color: theme.buttonText }]}>
              Save Data
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
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputUnit: {
    fontSize: 14,
  },
  bpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
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
