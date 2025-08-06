import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Pressable,
  useColorModeValue,
  useToast,
  KeyboardAvoidingView,
  ScrollView,
  Center,
} from 'native-base';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, clearError } = useAuthStore();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({
        title: 'Error',
        description: 'Please fill in all fields',
        placement: 'top',
      });
      return;
    }
    
    try {
      clearError();
      await login({ email, password });
      // Navigation will be handled by AppNavigator based on auth state
    } catch (loginError: any) {
      toast.show({
        title: 'Login Failed',
        description: loginError.message,
        placement: 'top',
      });
    }
  };
  
  const handleSkipLogin = () => {
    // For demo purposes, allow skipping login
    navigation.navigate('Main');
  };
  
  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView bg={bgColor} flex={1}>
        <Box flex={1} px={6} py={8}>
          {/* Header */}
          <Center mb={8} mt={12}>
            <VStack alignItems="center" space={4}>
              <Box
                w={20}
                h={20}
                bg="primary.500"
                rounded="full"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl" color="white">
                  🎵
                </Text>
              </Box>
              <VStack alignItems="center" space={1}>
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  MelodicBook
                </Text>
                <Text fontSize="lg" color="gray.600">
                  Your music, everywhere
                </Text>
              </VStack>
            </VStack>
          </Center>
          
          {/* Login Form */}
          <Box bg={cardBg} rounded="2xl" p={6} shadow={4} mb={6}>
            <VStack space={6}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Welcome Back! 👋
              </Text>
              
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Email Address
                  </Text>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    bg="gray.50"
                    borderRadius="xl"
                    py={4}
                    px={4}
                    fontSize="md"
                    _focus={{
                      borderColor: 'primary.500',
                      bg: 'white',
                    }}
                  />
                </VStack>
                
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Password
                  </Text>
                  <Input
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    type={showPassword ? 'text' : 'password'}
                    bg="gray.50"
                    borderRadius="xl"
                    py={4}
                    px={4}
                    fontSize="md"
                    _focus={{
                      borderColor: 'primary.500',
                      bg: 'white',
                    }}
                    InputRightElement={
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        mr={3}
                      >
                        <Text fontSize="lg">
                          {showPassword ? '🙈' : '👁️'}
                        </Text>
                      </Pressable>
                    }
                  />
                </VStack>
                
                <HStack justifyContent="flex-end">
                  <Pressable>
                    <Text fontSize="sm" color="primary.500" fontWeight="medium">
                      Forgot Password?
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
              
              <Button
                onPress={handleLogin}
                isLoading={isLoading}
                isLoadingText="Signing In..."
                bg="primary.500"
                rounded="xl"
                py={4}
                _pressed={{ bg: 'primary.600' }}
                _text={{
                  fontSize: 'lg',
                  fontWeight: 'semibold',
                }}
              >
                Sign In
              </Button>
              
              {/* Demo Skip Button */}
              <Button
                onPress={handleSkipLogin}
                variant="outline"
                borderColor="gray.300"
                rounded="xl"
                py={4}
                _text={{
                  fontSize: 'md',
                  color: 'gray.600',
                }}
              >
                Skip & Continue (Demo)
              </Button>
            </VStack>
          </Box>
          
          {/* Social Login */}
          <Box bg={cardBg} rounded="2xl" p={6} shadow={2} mb={6}>
            <VStack space={4} alignItems="center">
              <HStack alignItems="center" space={4} w="full">
                <Box flex={1} h="1px" bg="gray.200" />
                <Text fontSize="sm" color="gray.500">
                  Or continue with
                </Text>
                <Box flex={1} h="1px" bg="gray.200" />
              </HStack>
              
              <HStack space={4}>
                <Pressable>
                  <Box
                    w={12}
                    h={12}
                    bg="gray.100"
                    rounded="full"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xl">📱</Text>
                  </Box>
                </Pressable>
                <Pressable>
                  <Box
                    w={12}
                    h={12}
                    bg="gray.100"
                    rounded="full"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xl">🔍</Text>
                  </Box>
                </Pressable>
              </HStack>
            </VStack>
          </Box>
          
          {/* Sign Up Link */}
          <Center>
            <HStack space={1} alignItems="center">
              <Text fontSize="md" color="gray.600">
                Don't have an account?
              </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text fontSize="md" color="primary.500" fontWeight="semibold">
                  Sign Up
                </Text>
              </Pressable>
            </HStack>
          </Center>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
