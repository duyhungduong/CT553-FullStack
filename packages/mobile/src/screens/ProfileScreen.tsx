import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  ScrollView,
  Pressable,
  Switch,
  Divider,
  Badge,
  useColorModeValue,
} from 'native-base';

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <ScrollView bg={bgColor} flex={1}>
      {/* Header Section */}
      <Box bg="primary.500" pt={12} pb={8}>
        <VStack alignItems="center" space={4}>
          <Avatar
            size="xl"
            source={{
              uri: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
            }}
          >
            <Avatar.Badge bg="green.500" />
          </Avatar>
          <VStack alignItems="center" space={1}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Music Lover
            </Text>
            <Text fontSize="md" color="primary.100">
              user@example.com
            </Text>
            <Badge colorScheme="warning" variant="solid" borderRadius="full">
              Premium Member
            </Badge>
          </VStack>
        </VStack>
      </Box>

      {/* Stats Section */}
      <Box mx={4} mt={-6} mb={4}>
        <HStack space={4}>
          <Box flex={1} bg={cardBg} rounded="xl" p={4} shadow={2}>
            <VStack alignItems="center" space={1}>
              <Text fontSize="2xl" fontWeight="bold" color="primary.500">
                245
              </Text>
              <Text fontSize="sm" color="gray.500">
                Songs Played
              </Text>
            </VStack>
          </Box>
          <Box flex={1} bg={cardBg} rounded="xl" p={4} shadow={2}>
            <VStack alignItems="center" space={1}>
              <Text fontSize="2xl" fontWeight="bold" color="secondary.500">
                12
              </Text>
              <Text fontSize="sm" color="gray.500">
                Playlists
              </Text>
            </VStack>
          </Box>
          <Box flex={1} bg={cardBg} rounded="xl" p={4} shadow={2}>
            <VStack alignItems="center" space={1}>
              <Text fontSize="2xl" fontWeight="bold" color="success.500">
                48h
              </Text>
              <Text fontSize="sm" color="gray.500">
                Listening Time
              </Text>
            </VStack>
          </Box>
        </HStack>
      </Box>

      {/* Settings Section */}
      <VStack space={4} mx={4} mb={8}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Settings
        </Text>

        <Box bg={cardBg} rounded="xl" shadow={1}>
          <VStack space={0} divider={<Divider />}>
            <Pressable p={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">🎵</Text>
                  <Text fontSize="md" fontWeight="medium">
                    Audio Quality
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Text fontSize="sm" color="gray.500">
                    High
                  </Text>
                  <Text fontSize="lg">›</Text>
                </HStack>
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">📱</Text>
                  <Text fontSize="md" fontWeight="medium">
                    Notifications
                  </Text>
                </HStack>
                <Switch 
                  size="md" 
                  colorScheme="primary" 
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">🌙</Text>
                  <Text fontSize="md" fontWeight="medium">
                    Dark Mode
                  </Text>
                </HStack>
                <Switch 
                  size="md" 
                  colorScheme="gray" 
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                />
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">💾</Text>
                  <Text fontSize="md" fontWeight="medium">
                    Storage Used
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Text fontSize="sm" color="gray.500">
                    2.1 GB
                  </Text>
                  <Text fontSize="lg">›</Text>
                </HStack>
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">📥</Text>
                  <Text fontSize="md" fontWeight="medium">
                    Downloaded Songs
                  </Text>
                </HStack>
                <HStack alignItems="center" space={2}>
                  <Badge colorScheme="success" variant="solid" borderRadius="full">
                    25
                  </Badge>
                  <Text fontSize="lg">›</Text>
                </HStack>
              </HStack>
            </Pressable>
          </VStack>
        </Box>

        {/* Account Section */}
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Account
        </Text>

        <Box bg={cardBg} rounded="xl" shadow={1}>
          <VStack space={0} divider={<Divider />}>
            <Pressable p={4}>
              <HStack alignItems="center" space={3}>
                <Text fontSize="lg">❓</Text>
                <Text fontSize="md" fontWeight="medium">
                  Help & Support
                </Text>
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" space={3}>
                <Text fontSize="lg">🔒</Text>
                <Text fontSize="md" fontWeight="medium">
                  Privacy Policy
                </Text>
              </HStack>
            </Pressable>

            <Pressable p={4}>
              <HStack alignItems="center" space={3}>
                <Text fontSize="lg">🚪</Text>
                <Text fontSize="md" fontWeight="medium" color="error.500">
                  Sign Out
                </Text>
              </HStack>
            </Pressable>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  );
};

export default ProfileScreen;
