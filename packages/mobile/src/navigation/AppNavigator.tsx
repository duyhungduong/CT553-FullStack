import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';
import { useAuthStore } from '../store/authStore';

// Enable screens (for better performance)
import { enableScreens } from 'react-native-screens';
enableScreens();

// Khởi tạo Stack Navigator
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  
  // Load stored auth on app start
  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);
  
  // Show loading screen while checking auth
  if (isLoading) {
    return null; // You can add a proper loading screen here
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is authenticated - show main app
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator} 
          />
        ) : (
          // User is not authenticated - show auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
            />
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;