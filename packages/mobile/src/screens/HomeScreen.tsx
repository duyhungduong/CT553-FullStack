import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Image,
  Pressable,
  Badge,
  Avatar,
  useColorModeValue,
} from 'native-base';

const HomeScreen = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const featuredAlbums = [
    {
      id: 1,
      title: 'Midnight Vibes',
      artist: 'Luna Sky',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
      plays: '2.1M',
    },
    {
      id: 2,
      title: 'Golden Hours',
      artist: 'The Dreamers',
      image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=300',
      plays: '1.8M',
    },
    {
      id: 3,
      title: 'Electric Nights',
      artist: 'Neon Wave',
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300',
      plays: '3.2M',
    },
  ];

  const recentlyPlayed = [
    {
      id: 1,
      title: 'Starlight',
      artist: 'Cosmic Band',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100',
      duration: '3:45',
    },
    {
      id: 2,
      title: 'Ocean Dreams',
      artist: 'Blue Waves',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100',
      duration: '4:12',
    },
    {
      id: 3,
      title: 'City Lights',
      artist: 'Urban Echo',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
      duration: '3:28',
    },
  ];

  return (
    <ScrollView bg={bgColor} flex={1}>
      {/* Header */}
      <Box bg="primary.500" pt={12} pb={6}>
        <HStack alignItems="center" justifyContent="space-between" mx={4}>
          <VStack>
            <Text fontSize="lg" color="primary.100">
              Good morning
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Welcome back! 🎵
            </Text>
          </VStack>
          <Avatar
            size="md"
            source={{
              uri: 'https://images.unsplash.com/photo-1614289371518-722f2615943d?w=100',
            }}
          />
        </HStack>
      </Box>

      {/* Quick Actions */}
      <Box mx={4} mt={-3} mb={6}>
        <HStack space={3}>
          <Pressable flex={1}>
            <Box bg={cardBg} rounded="xl" p={4} shadow={2}>
              <HStack alignItems="center" space={3}>
                <Box bg="success.500" p={2} rounded="full">
                  <Text fontSize="lg">▶️</Text>
                </Box>
                <VStack>
                  <Text fontSize="md" fontWeight="semibold">
                    Resume
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Last played
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Pressable>
          <Pressable flex={1}>
            <Box bg={cardBg} rounded="xl" p={4} shadow={2}>
              <HStack alignItems="center" space={3}>
                <Box bg="secondary.500" p={2} rounded="full">
                  <Text fontSize="lg">🔀</Text>
                </Box>
                <VStack>
                  <Text fontSize="md" fontWeight="semibold">
                    Shuffle
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    All songs
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Pressable>
        </HStack>
      </Box>

      {/* Featured Albums */}
      <VStack space={4} mx={4} mb={6}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold" color="gray.700">
            Featured Albums
          </Text>
          <Pressable>
            <Text fontSize="md" color="primary.500" fontWeight="medium">
              See All
            </Text>
          </Pressable>
        </HStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space={4}>
            {featuredAlbums.map((album) => (
              <Pressable key={album.id}>
                <Box w={200} bg={cardBg} rounded="xl" shadow={2} overflow="hidden">
                  <Image
                    source={{ uri: album.image }}
                    alt={album.title}
                    h={160}
                    w="full"
                    resizeMode="cover"
                  />
                  <VStack p={4} space={2}>
                    <Text fontSize="lg" fontWeight="bold" numberOfLines={1}>
                      {album.title}
                    </Text>
                    <Text fontSize="md" color="gray.500" numberOfLines={1}>
                      {album.artist}
                    </Text>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Badge colorScheme="primary" variant="subtle" borderRadius="full">
                        {album.plays} plays
                      </Badge>
                      <Text fontSize="lg">❤️</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>
      </VStack>

      {/* Recently Played */}
      <VStack space={4} mx={4} mb={8}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold" color="gray.700">
            Recently Played
          </Text>
          <Pressable>
            <Text fontSize="md" color="primary.500" fontWeight="medium">
              View All
            </Text>
          </Pressable>
        </HStack>

        <Box bg={cardBg} rounded="xl" shadow={1} overflow="hidden">
          <VStack space={0}>
            {recentlyPlayed.map((song, index) => (
              <Pressable key={song.id}>
                <HStack
                  alignItems="center"
                  space={3}
                  p={4}
                  borderBottomWidth={index < recentlyPlayed.length - 1 ? 1 : 0}
                  borderBottomColor="gray.100"
                >
                  <Image
                    source={{ uri: song.image }}
                    alt={song.title}
                    size={12}
                    rounded="md"
                  />
                  <VStack flex={1} space={1}>
                    <Text fontSize="md" fontWeight="semibold" numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500" numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </VStack>
                  <VStack alignItems="flex-end" space={1}>
                    <Text fontSize="sm" color="gray.400">
                      {song.duration}
                    </Text>
                    <Text fontSize="lg">⋯</Text>
                  </VStack>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </VStack>

      {/* Trending Now */}
      <VStack space={4} mx={4} mb={8}>
        <Text fontSize="xl" fontWeight="bold" color="gray.700">
          Trending Now 🔥
        </Text>
        <HStack space={3}>
          <Box flex={1} bg="gradient(to-r, #667eea, #764ba2)" rounded="xl" p={6}>
            <VStack space={2}>
              <Text fontSize="sm" color="white" opacity={0.8}>
                #1 TRENDING
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                Summer Hits 2024
              </Text>
              <Text fontSize="sm" color="white" opacity={0.9}>
                50 songs • 3.2M plays
              </Text>
            </VStack>
          </Box>
          <Box flex={1} bg="gradient(to-r, #f093fb, #f5576c)" rounded="xl" p={6}>
            <VStack space={2}>
              <Text fontSize="sm" color="white" opacity={0.8}>
                WEEKLY TOP
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                Chill Vibes
              </Text>
              <Text fontSize="sm" color="white" opacity={0.9}>
                32 songs • 1.8M plays
              </Text>
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </ScrollView>
  );
};

export default HomeScreen;
