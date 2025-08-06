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
  Checkbox,
} from 'native-base';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { register, isLoading, clearError } = useAuthStore();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.show({
        title: 'Error',
        description: 'Please fill in all fields',
        placement: 'top',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.show({
        title: 'Error',
        description: 'Passwords do not match',
        placement: 'top',
      });
      return;
    }
    
    if (password.length < 6) {
      toast.show({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        placement: 'top',
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast.show({
        title: 'Error',
        description: 'Please agree to terms and conditions',
        placement: 'top',
      });
      return;
    }
    
    try {
      clearError();
      await register({ name, email, password, confirmPassword });
      // Navigation will be handled by AppNavigator based on auth state
    } catch (registerError: any) {
      toast.show({
        title: 'Registration Failed',
        description: registerError.message,
        placement: 'top',
      });
    }
  };
  
  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView bg={bgColor} flex={1}>
        <Box flex={1} px={6} py={8}>
          {/* Header */}
          <Center mb={8} mt={8}>
            <VStack alignItems="center" space={4}>
              <Box
                w={20}
                h={20}
                bg="secondary.500"
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
                  Join MelodicBook
                </Text>
                <Text fontSize="lg" color="gray.600">
                  Create your music account
                </Text>
              </VStack>
            </VStack>
          </Center>
          
          {/* Register Form */}
          <Box bg={cardBg} rounded="2xl" p={6} shadow={4} mb={6}>
            <VStack space={6}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Sign Up 🚀
              </Text>
              
              <VStack space={4}>
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Full Name
                  </Text>
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    bg="gray.50"
                    borderRadius="xl"
                    py={4}
                    px={4}
                    fontSize="md"
                    _focus={{
                      borderColor: 'secondary.500',
                      bg: 'white',
                    }}
                  />
                </VStack>
                
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
                      borderColor: 'secondary.500',
                      bg: 'white',
                    }}
                  />
                </VStack>
                
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Password
                  </Text>
                  <Input
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    type={showPassword ? 'text' : 'password'}
                    bg="gray.50"
                    borderRadius="xl"
                    py={4}
                    px={4}
                    fontSize="md"
                    _focus={{
                      borderColor: 'secondary.500',
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
                
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Confirm Password
                  </Text>
                  <Input
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    type={showConfirmPassword ? 'text' : 'password'}
                    bg="gray.50"
                    borderRadius="xl"
                    py={4}
                    px={4}
                    fontSize="md"
                    _focus={{
                      borderColor: 'secondary.500',
                      bg: 'white',
                    }}
                    InputRightElement={
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        mr={3}
                      >
                        <Text fontSize="lg">
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </Text>
                      </Pressable>
                    }
                  />
                </VStack>
                
                <HStack alignItems="flex-start" space={3}>
                  <Checkbox
                    value="terms"
                    isChecked={agreeToTerms}
                    onChange={setAgreeToTerms}
                    colorScheme="secondary"
                    mt={1}
                  />
                  <VStack flex={1}>
                    <Text fontSize="sm" color="gray.600" lineHeight="sm">
                      I agree to the{' '}
                      <Text color="secondary.500" fontWeight="medium">
                        Terms of Service
                      </Text>{' '}
                      and{' '}
                      <Text color="secondary.500" fontWeight="medium">
                        Privacy Policy
                      </Text>
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
              
              <Button
                onPress={handleRegister}
                isLoading={isLoading}
                isLoadingText="Creating Account..."
                bg="secondary.500"
                rounded="xl"
                py={4}
                _pressed={{ bg: 'secondary.600' }}
                _text={{
                  fontSize: 'lg',
                  fontWeight: 'semibold',
                }}
              >
                Create Account
              </Button>
            </VStack>
          </Box>
          
          {/* Sign In Link */}
          <Center>
            <HStack space={1} alignItems="center">
              <Text fontSize="md" color="gray.600">
                Already have an account?
              </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text fontSize="md" color="secondary.500" fontWeight="semibold">
                  Sign In
                </Text>
              </Pressable>
            </HStack>
          </Center>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
