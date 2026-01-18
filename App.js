import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Contexts
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import RecordingScreen from './src/screens/RecordingScreen';
import AdminScreen from './src/screens/AdminScreen';
import { UploadScreen, ManualSyncScreen, RoomDetailScreen, GroupsScreen, RegisterScreen } from './src/screens';
import { COLORS } from './src/theme/colors';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminDashboard" component={AdminScreen} />
          ) : (
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          )}

          <Stack.Screen
            name="Recording"
            component={RecordingScreen}
            options={{
              presentation: 'card',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="ManualSync" component={ManualSyncScreen} />
          <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
          <StatusBar style="light" backgroundColor={COLORS.background} />
          <AppContent />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
