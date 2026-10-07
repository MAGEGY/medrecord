import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { medicineService } from '@/utils/data';
import { Medicine } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useCallback } from 'react'; // Import useCallback

export default function DatabaseScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation(); // Get navigation object
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Callback to receive OCR scanned text
  const handleScanResult = useCallback((scannedText: string) => {
    setSearchQuery(scannedText); // Populate search bar with scanned text
    // In a real app, you might want to parse the text and pre-fill a new medicine form
  }, []);

  const handleScanPress = () => {
    // Navigate to OCRScanner screen and pass the callback
    navigation.navigate('OCRScanner' as never, { onScan: handleScanResult } as never);
  };

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

  const renderMedicineCard = ({ item }: { item: Medicine }) => (
    <Pressable
      style={[styles.medicineCard, { backgroundColor: theme.surface }]}
      android_ripple={{ color: theme.primary + '20' }}
    >
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <ThemedText style={[styles.medicineName, { color: theme.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.genericName, { color: theme.textSecondary }]}>
            {item.genericName}
          </ThemedText>
        </View>
        <View style={[styles.strengthBadge, { backgroundColor: theme.primary + '20' }]}>
          <ThemedText style={[styles.strengthText, { color: theme.primary }]}>
            {item.strength}
          </ThemedText>
        </View>
      </View>

      <View style={styles.medicineDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="factory" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
            {item.manufacturer}
          </ThemedText>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="pill" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
            {item.dosageForm}
          </ThemedText>
        </View>
        {item.stockLevel !== undefined && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={16} 
              color={item.stockLevel < 100 ? theme.warning : theme.success} 
            />
            <ThemedText style={[
              styles.detailText, 
              { color: item.stockLevel < 100 ? theme.warning : theme.success }
            ]}>
              Stock: {item.stockLevel}
            </ThemedText>
          </View>
        )}
      </View>

      {item.interactions && item.interactions.length > 0 && (
        <View style={[styles.interactionsBox, { backgroundColor: theme.warning + '10', borderColor: theme.warning }]}>
          <MaterialCommunityIcons name="alert" size={16} color={theme.warning} />
          <ThemedText style={[styles.interactionsText, { color: theme.warning }]}>
            Interactions: {item.interactions.join(', ')}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search medicines..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable onPress={handleScanPress} style={styles.scanButton}>
            <MaterialCommunityIcons name="line-scan" size={24} color={theme.primary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicineCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshing={loading}
        onRefresh={loadMedicines}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="database-off" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchQuery ? 'No medicines found' : 'Medicine database is empty'}
            </ThemedText>
          </View>
        }
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
  scanButton: {
    paddingLeft: Spacing.md,
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
  strengthBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '500',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.xl,
  },
});
