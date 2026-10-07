import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Alert, FlatList } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { patientService, vitalSignsService } from '@/utils/data';
import { User, VitalSign } from '@/types';
import { useRoute } from '@react-navigation/native';
import { DoctorTabParamList } from '@/navigation/DoctorTabNavigator';
import { RouteProp } from '@react-navigation/native';

type PatientDetailScreenRouteProp = RouteProp<DoctorTabParamList, 'PatientDetail'>;

export default function PatientDetailScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth(); // Doctor user
  const route = useRoute<PatientDetailScreenRouteProp>();
  const { patientId } = route.params;

  const [patient, setPatient] = useState<User | null>(null);
  const [vitalSigns, setVitalSigns] = useState<Omit<VitalSign, 'id' | 'patientId' | 'recordedAt' | 'recordedBy'>>({});
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [patientVitalsHistory, setPatientVitalsHistory] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const fetchedPatient = await patientService.getById(patientId);
      setPatient(fetchedPatient);
      const fetchedVitals = await vitalSignsService.getByPatientId(patientId);
      setPatientVitalsHistory(fetchedVitals.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
    } catch (error) {
      console.error('Error loading patient data:', error);
      Alert.alert('Error', 'Failed to load patient data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitalSigns = async () => {
    if (!currentUser || !patient) return;
    try {
      const newVitalSign: Omit<VitalSign, 'id'> = {
        ...vitalSigns,
        patientId: patient.id,
        recordedBy: currentUser.id, // Doctor's ID
        recordedAt: new Date().toISOString(),
      };
      await vitalSignsService.add(newVitalSign);
      setVitalSigns({}); // Clear form
      loadPatientData(); // Refresh history
      Alert.alert('Success', 'Vital signs recorded successfully.');
    } catch (error) {
      console.error('Error recording vital signs:', error);
      Alert.alert('Error', 'Failed to record vital signs.');
    }
  };

  const handleAddClinicalNotes = async () => {
    if (!currentUser || !patient || !clinicalNotes.trim()) return;
    try {
      // In a real app, this would save to a separate notes service/model
      // For mock, we'll just log it or add to a mock patient notes array
      console.log(`Doctor ${currentUser.displayName} added notes for ${patient.displayName}: ${clinicalNotes}`);
      Alert.alert('Success', 'Clinical notes added successfully.');
      setClinicalNotes(''); // Clear notes input
      // Ideally, reload notes from a service if available
    } catch (error) {
      console.error('Error adding clinical notes:', error);
      Alert.alert('Error', 'Failed to add clinical notes.');
    }
  };

  const VitalInput = ({ label, value, onChangeText, keyboardType = 'default', unit = '' }: any) => (
    <View style={styles.vitalInputContainer}>
      <ThemedText style={[styles.vitalLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <TextInput
        style={[styles.vitalInput, { color: theme.text, backgroundColor: theme.surface }]}
        value={value ? String(value) : ''}
        onChangeText={(text) => onChangeText(text === '' ? undefined : Number(text))}
        keyboardType={keyboardType}
        placeholderTextColor={theme.textSecondary}
        placeholder={unit}
      />
    </View>
  );

  const renderVitalHistoryItem = ({ item }: { item: VitalSign }) => (
    <View style={[styles.vitalHistoryCard, { backgroundColor: theme.surface }]}>
      <ThemedText style={[styles.vitalHistoryDate, { color: theme.textSecondary }]}>
        {new Date(item.recordedAt).toLocaleDateString()} at {new Date(item.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </ThemedText>
      <View style={styles.vitalHistoryRow}>
        {item.bloodPressureSystolic && item.bloodPressureDiastolic && (
          <ThemedText style={[styles.vitalHistoryText, { color: theme.text }]}>
            <MaterialCommunityIcons name="heart-pulse" size={16} color={theme.primary} /> BP: {item.bloodPressureSystolic}/{item.bloodPressureDiastolic} mmHg
          </ThemedText>
        )}
        {item.heartRate && (
          <ThemedText style={[styles.vitalHistoryText, { color: theme.text }]}>
            <MaterialCommunityIcons name="heart-flash" size={16} color={theme.error} /> HR: {item.heartRate} bpm
          </ThemedText>
        )}
      </View>
      <View style={styles.vitalHistoryRow}>
        {item.temperature && (
          <ThemedText style={[styles.vitalHistoryText, { color: theme.text }]}>
            <MaterialCommunityIcons name="thermometer" size={16} color={theme.warning} /> Temp: {item.temperature}°C
          </ThemedText>
        )}
        {item.oxygenSaturation && (
          <ThemedText style={[styles.vitalHistoryText, { color: theme.text }]}>
            <MaterialCommunityIcons name="lungs" size={16} color={theme.success} /> SpO2: {item.oxygenSaturation}%
          </ThemedText>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Feather name="loader" size={32} color={theme.primary} />
        <ThemedText style={{ color: theme.text, marginTop: Spacing.md }}>Loading patient data...</ThemedText>
      </ThemedView>
    );
  }

  if (!patient) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={{ color: theme.error }}>Patient not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.patientHeader}>
        <ThemedText style={[styles.patientName, { color: theme.text }]}>
          {patient.displayName}
        </ThemedText>
        <ThemedText style={[styles.patientId, { color: theme.textSecondary }]}>
          ID: {patient.id}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Record Vital Signs</ThemedText>
        <View style={styles.vitalInputsGrid}>
          <VitalInput 
            label="Systolic BP" 
            value={vitalSigns.bloodPressureSystolic} 
            onChangeText={(val: number | undefined) => setVitalSigns(prev => ({ ...prev, bloodPressureSystolic: val }))} 
            keyboardType="numeric" 
            unit="mmHg"
          />
          <VitalInput 
            label="Diastolic BP" 
            value={vitalSigns.bloodPressureDiastolic} 
            onChangeText={(val: number | undefined) => setVitalSigns(prev => ({ ...prev, bloodPressureDiastolic: val }))} 
            keyboardType="numeric" 
            unit="mmHg"
          />
          <VitalInput 
            label="Heart Rate" 
            value={vitalSigns.heartRate} 
            onChangeText={(val: number | undefined) => setVitalSigns(prev => ({ ...prev, heartRate: val }))} 
            keyboardType="numeric" 
            unit="bpm"
          />
          <VitalInput 
            label="Temperature" 
            value={vitalSigns.temperature} 
            onChangeText={(val: number | undefined) => setVitalSigns(prev => ({ ...prev, temperature: val }))} 
            keyboardType="numeric" 
            unit="°C"
          />
          <VitalInput 
            label="Oxygen Sat." 
            value={vitalSigns.oxygenSaturation} 
            onChangeText={(val: number | undefined) => setVitalSigns(prev => ({ ...prev, oxygenSaturation: val }))} 
            keyboardType="numeric" 
            unit="%"
          />
        </View>
        <Pressable
          style={[styles.recordButton, { backgroundColor: theme.primary }]}
          onPress={handleRecordVitalSigns}
        >
          <ThemedText style={[styles.recordButtonText, { color: theme.buttonText }]}>
            Record Vitals
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Vitals History</ThemedText>
        {patientVitalsHistory.length > 0 ? (
          <FlatList
            data={patientVitalsHistory}
            renderItem={renderVitalHistoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable inner scroll as it's in a ScrollView
          />
        ) : (
          <ThemedText style={[styles.noHistoryText, { color: theme.textSecondary }]}>No vital signs history.</ThemedText>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Clinical Notes</ThemedText>
        <TextInput
          style={[styles.notesInput, { backgroundColor: theme.surface, color: theme.text }]}
          placeholder="Add clinical notes..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          value={clinicalNotes}
          onChangeText={setClinicalNotes}
        />
        <Pressable
          style={[styles.addNotesButton, { backgroundColor: theme.secondary }]}
          onPress={handleAddClinicalNotes}
        >
          <ThemedText style={[styles.addNotesButtonText, { color: theme.buttonText }]}>
            Add Notes
          </ThemedText>
        </Pressable>
        {/* Placeholder for displaying saved notes if a notes service existed */}
        <ThemedText style={[styles.noHistoryText, { color: theme.textSecondary, marginTop: Spacing.md }]}>
          (Notes will be saved to patient record)
        </ThemedText>
      </View>
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
  patientHeader: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  patientName: {
    fontSize: 24,
    fontWeight: '600',
  },
  patientId: {
    fontSize: 14,
    marginTop: Spacing.xs,
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
  vitalInputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  vitalInputContainer: {
    width: '48%',
    marginBottom: Spacing.md,
  },
  vitalLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  vitalInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  recordButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  vitalHistoryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  vitalHistoryDate: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  vitalHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  vitalHistoryText: {
    fontSize: 14,
  },
  noHistoryText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notesInput: {
    minHeight: 100,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  addNotesButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNotesButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
