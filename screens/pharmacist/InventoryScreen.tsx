import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { medicineService } from '@/utils/data';
import { Medicine } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MedicineFormModal from '@/components/MedicineFormModal'; // Import MedicineFormModal

export default function InventoryScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMedicineFormModal, setShowMedicineFormModal] = useState(false); // State for form modal visibility
  const [selectedMedicineForEdit, setSelectedMedicineForEdit] = useState<Medicine | null>(null); // State for medicine being edited

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchQuery, medicines]);

  const loadMedicines = async () => {
    try {
      const data = await medicineService.getAll();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedicine = async (medicine: Omit<Medicine, 'id'>, id?: string) => {
    try {
      if (id) {
        // Edit existing medicine
        await medicineService.update(id, medicine);
        Alert.alert('Success', 'Medicine updated successfully!');
      } else {
        // Add new medicine
        await medicineService.add(medicine);
        Alert.alert('Success', 'Medicine added successfully!');
      }
      loadMedicines(); // Refresh the list
    } catch (error) {
      console.error('Error saving medicine:', error);
      Alert.alert('Error', 'Failed to save medicine.');
    }
    setShowMedicineFormModal(false);
    setSelectedMedicineForEdit(null);
  };

  const addMedicine = () => {
    setSelectedMedicineForEdit(null);
    setShowMedicineFormModal(true);
  };

  const renderMedicineCard = ({ item }: { item: Medicine }) => {
    const isLowStock = item.stockLevel !== undefined && item.stockLevel < 100;
    
    return (
          <Pressable
            style={[styles.medicineCard, { backgroundColor: theme.surface }]}
            android_ripple={{ color: theme.primary + '20' }}
            onPress={() => Alert.alert(
              item.name,
              `Manufacturer: ${item.manufacturer}\nStrength: ${item.strength}\nStock: ${item.stockLevel || 'N/A'}\n\nWhat would you like to do?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Edit', onPress: () => {
                  setSelectedMedicineForEdit(item);
                  setShowMedicineFormModal(true);
                }},
                // Potentially add delete option here
              ]
            )}
          >        <View style={styles.medicineHeader}>
          <View style={styles.medicineInfo}>
            <ThemedText style={[styles.medicineName, { color: theme.text }]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.genericName, { color: theme.textSecondary }]}>
              {item.genericName}
            </ThemedText>
          </View>
          <View style={[
            styles.stockBadge,
            { backgroundColor: isLowStock ? theme.error + '20' : theme.success + '20' }
          ]}>
            <ThemedText style={[
              styles.stockText,
              { color: isLowStock ? theme.error : theme.success }
            ]}>
              {item.stockLevel || 0}
            </ThemedText>
          </View>
        </View>

        <View style={styles.medicineDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="pill" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
              {item.strength} • {item.dosageForm}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="factory" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
              {item.manufacturer}
            </ThemedText>
          </View>
          {item.expiryDate && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar" size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </ThemedText>
            </View>
          )}
        </View>

        {isLowStock && (
          <View style={[styles.alertBox, { backgroundColor: theme.error + '10', borderColor: theme.error }]}>
            <MaterialCommunityIcons name="alert" size={16} color={theme.error} />
            <ThemedText style={[styles.alertText, { color: theme.error }]}>
              Low stock - reorder required
            </ThemedText>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search inventory..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing['5xl'] },
        ]}
        refreshing={loading}
        onRefresh={loadMedicines}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchQuery ? 'No medicines found' : 'Inventory is empty'}
            </ThemedText>
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
        onPress={addMedicine}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <MedicineFormModal
        visible={showMedicineFormModal}
        onClose={() => {
          setShowMedicineFormModal(false);
          setSelectedMedicineForEdit(null);
        }}
        onSave={handleSaveMedicine}
        initialMedicine={selectedMedicineForEdit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
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
  medicineCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  genericName: {
    fontSize: 14,
  },
  stockBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    minWidth: 50,
    alignItems: 'center',
  },
  stockText: {
    fontSize: 16,
    fontWeight: '700',
  },
  medicineDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: 14,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  alertText: {
    fontSize: 12,
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
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
