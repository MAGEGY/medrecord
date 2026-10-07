import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function LoginScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { login, authenticateWithBiometric, loginWithBiometric } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true); // Start loading state for biometric login
    try {
      const success = await loginWithBiometric();
      if (!success) {
        Alert.alert('Biometric Login Failed', 'Please try again or use your credentials.');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric login failed. Please try again.');
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>MedRecord</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Medical Records & Prescription Management
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface }]}
              placeholder="Username or Phone Number"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.biometricButton} onPress={handleBiometricLogin}>
            <MaterialCommunityIcons name="fingerprint" size={32} color={theme.primary} />
            <ThemedText style={[styles.biometricText, { color: theme.primary }]}>
              Use Biometric
            </ThemedText>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')}>
            <ThemedText style={[styles.registerText, { color: theme.link }]}>
              Don't have an account? Register
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing['5xl'],
    marginBottom: Spacing['4xl'],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    paddingLeft: Spacing['5xl'],
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  biometricButton: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  biometricText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  registerText: {
    textAlign: 'center',
    marginTop: Spacing['3xl'],
    fontSize: 14,
  },
});
