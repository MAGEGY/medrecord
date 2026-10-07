import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, TextInput, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Medicine } from '@/types';
import { medicineService } from '@/utils/data';

interface MedicineSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMedicine: (medicine: Medicine) => void;
}

const MedicineSearchModal: React.FC<MedicineSearchModalProps> = ({
  visible,
  onClose,
  onSelectMedicine,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllMedicines();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allMedicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(allMedicines);
    }
  }, [searchQuery, allMedicines]);

  const loadAllMedicines = async () => {
    try {
      const data = await medicineService.getAll();
      setAllMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error('Error loading all medicines:', error);
      Alert.alert('Error', 'Failed to load medicine database.');
    } finally {
      setLoading(false);
    }
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <Pressable
      style={[styles.medicineItem, { backgroundColor: theme.surface }]}
      onPress={() => {
        onSelectMedicine(item);
        onClose();
      }}
      android_ripple={{ color: theme.primary + '20' }}
    >
      <View style={styles.medicineInfo}>
        <ThemedText style={[styles.medicineName, { color: theme.text }]}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.medicineGeneric, { color: theme.textSecondary }]}>
          {item.genericName}
        </ThemedText>
      </View>
      <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.primary} />
    </Pressable>
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
              Search & Add Medicine
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
            <Feather name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search medicines..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Feather name="loader" size={32} color={theme.primary} />
              <ThemedText style={{ color: theme.text, marginTop: Spacing.md }}>Loading medicines...</ThemedText>
            </View>
          ) : (
            <FlatList
              data={filteredMedicines}
              renderItem={renderMedicineItem}
              keyExtractor={(item) => item.id}
              style={styles.medicineList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No medicines found.
                  </ThemedText>
                </View>
              }
            />
          )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  medicineList: {
    flex: 1,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  medicineGeneric: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: 16,
  },
});
