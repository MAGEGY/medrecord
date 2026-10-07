import React from 'react';
import QRCodeSVG from 'react-native-qrcode-svg';
import { useTheme } from '@/hooks/useTheme';
import { View, StyleSheet } from 'react-native';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  color?: string; // foreground color
  backgroundColor?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  color,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const qrColor = color || theme.text;
  const qrBackgroundColor = backgroundColor || theme.background;

  return (
    <View style={styles.container}>
      <QRCodeSVG
        value={value}
        size={size}
        color={qrColor}
        backgroundColor={qrBackgroundColor}
        // You can add an optional logo here if needed, e.g., for branding
        // logo={{uri: 'data:image/png;base64,...'}}
        // logoSize={30}
        // logoBackgroundColor='transparent'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QRCodeGenerator;
