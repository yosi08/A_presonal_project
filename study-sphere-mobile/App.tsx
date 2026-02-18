import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import './src/i18n';

function ThemedApp() {
  const { settings, isHydrated } = useApp();

  if (!isHydrated) return null;

  return (
    <ThemeProvider theme={settings.theme}>
      <RootNavigator />
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <ThemedApp />
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
