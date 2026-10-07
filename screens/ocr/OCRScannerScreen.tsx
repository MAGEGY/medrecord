import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Pressable, Alert, ScrollView } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner, CameraCaptureError } from 'react-native-vision-camera';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Spacing, BorderRadius } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useOCR, OcrResult } from 'react-native-vision-camera-ocr-plus';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OCRScannerScreenProps {
  navigation: any;
  route: any;
}

export default function OCRScannerScreen({ navigation, route }: OCRScannerScreenProps) {
  const { theme } = useTheme();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const isFocused = useIsFocused(); // Ensures camera is active only when screen is focused

  const camera = useRef<Camera>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [ocrText, setOcrText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize OCR hook
  const { ocr, frameProcessor } = useOCR({
    // Optional: configuration for OCR, e.g., language
    // recognizerLanguage: 'Latin', 
    onDetect: (result: OcrResult) => {
      if (isScanning && result.text && !isProcessing) {
        setIsProcessing(true); // Prevent re-processing until current result is handled
        setOcrText(result.text);
        // Optionally, stop scanning after the first detection
        // setIsScanning(false); 
        // console.log('OCR Result:', result.text); // For debugging
        // You might want to automatically navigate back or show a confirmation here
      }
    },
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={{ color: theme.text }}>
          Camera permission not granted.
        </ThemedText>
        <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
            Grant Permission
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!device) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={{ color: theme.text }}>
          No camera device found.
        </ThemedText>
      </ThemedView>
    );
  }

  const handleConfirmOCR = () => {
    if (ocrText) {
      // Return the OCR text to the previous screen
      route.params?.onScan(ocrText);
      navigation.goBack();
    } else {
      Alert.alert('No Text Found', 'Please scan a document with text.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && isScanning}
        photo={true}
        frameProcessor={frameProcessor} // Attach the OCR frame processor
        frameProcessorFps={1} // Process frames at 1 FPS for OCR
      />

      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </Pressable>
          <ThemedText style={styles.title}>Scan Document</ThemedText>
        </View>

        {ocrText ? (
          <View style={[styles.resultContainer, { backgroundColor: theme.surface }]}>
            <ScrollView style={styles.textPreviewScroll}>
              <ThemedText style={[styles.textPreview, { color: theme.text }]}>{ocrText}</ThemedText>
            </ScrollView>
            <View style={styles.resultActions}>
              <Pressable
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.error }]}
                onPress={() => {
                  setOcrText('');
                  setIsProcessing(false);
                  setIsScanning(true);
                }}
              >
                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                  Rescan
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton, { backgroundColor: theme.primary }]}
                onPress={handleConfirmOCR}
              >
                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                  Use Text
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.hintContainer}>
            <MaterialCommunityIcons name="line-scan" size={48} color="white" />
            <ThemedText style={styles.hintText}>
              Align the document within the frame to scan text.
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    position: 'absolute',
    top: 0,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.md,
    padding: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scanArea: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.4,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: BorderRadius.sm,
    marginTop: SCREEN_HEIGHT * 0.2, // Adjust position as needed
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: Spacing['5xl'],
    position: 'absolute',
    bottom: Spacing['5xl'],
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.5,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  textPreviewScroll: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.3,
    marginBottom: Spacing.lg,
  },
  textPreview: {
    fontSize: 16,
    textAlign: 'center',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'red', // Example color
  },
  confirmButton: {
    backgroundColor: 'green', // Example color
  },
});
