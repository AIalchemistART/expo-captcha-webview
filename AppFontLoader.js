import React from 'react';
import * as Font from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

export default function AppFontLoader({ children }) {
  const [fontsLoaded] = Font.useFonts({
    'Cardo-Regular': require('./assets/fonts/Cardo-Regular.ttf'),
    'Cardo-Bold': require('./assets/fonts/Cardo-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A004B' }}>
        <ActivityIndicator size="large" color="gold" />
      </View>
    );
  }
  return children;
}
