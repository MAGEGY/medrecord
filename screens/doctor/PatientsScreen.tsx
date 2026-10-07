import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { patientService } from '@/utils/data';
import { User } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const AVATARS = [
  require('@/assets/avatars/stethoscope.png'),
  require('@/assets/avatars/medical-cross.png'),
  require('@/assets/avatars/heartbeat.png'),
];

export default function PatientsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<User[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(p =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPatientCard = ({ item }: { item: User }) => (
    <Pressable
      style={[styles.patientCard, { backgroundColor: theme.surface }]}
      android_ripple={{ color: theme.primary + '20' }}
      onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })} // Navigate to PatientDetail
    >
      <Image source={AVATARS[item.avatarIndex]} style={styles.avatar} />
      <View style={styles.patientInfo}>
        <ThemedText style={[styles.patientName, { color: theme.text }]}>
          {item.displayName}
        </ThemedText>
        <ThemedText style={[styles.patientId, { color: theme.textSecondary }]}>
          ID: {item.id}
        </ThemedText>
        <ThemedText style={[styles.patientPhone, { color: theme.textSecondary }]}>
          {item.phoneNumber}
        </ThemedText>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require('@/assets/illustrations/no-patients.png')}
        style={styles.emptyImage}
      />
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        {searchQuery ? 'No patients found' : 'No patients registered yet'}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search patients..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadPatients}
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
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.lg,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  patientId: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  patientPhone: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
  },
});
