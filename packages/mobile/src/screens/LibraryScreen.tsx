import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Pressable,
  Image,
  Badge,
  Input,
  useColorModeValue,
} from 'native-base';

const LibraryScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const libraryItems = [
    {
      id: 1,
      type: 'playlist',
      title: 'Liked Songs',
      count: 124,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
      gradient: true,
    },
    {
      id: 2,
      type: 'playlist',
      title: 'My Chill Mix',
      count: 32,
      image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=100',
      gradient: false,
    },
    {
      id: 3,
      type: 'album',
      title: 'Midnight Dreams',
      artist: 'Luna Sky',
      count: 12,
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=100',
      gradient: false,
    },
    {
      id: 4,
      type: 'playlist',
      title: 'Workout Beats',
      count: 45,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100',
      gradient: false,
    },
    {
      id: 5,
      type: 'artist',
      title: 'The Dreamers',
      count: 28,
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100',
      gradient: false,
    },
  ];

  const recentlyPlayed = [
    {
      id: 1,
      title: 'Starlight',
      artist: 'Cosmic Band',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100',
      playedAt: '2 hours ago',
    },
    {
      id: 2,
      title: 'Ocean Dreams',
      artist: 'Blue Waves',
      image: 'https://images.unsplash.com/photo-1571974599782-87624638275c?w=100',
      playedAt: '5 hours ago',
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: libraryItems.length },
    { id: 'playlists', label: 'Playlists', count: 3 },
    { id: 'artists', label: 'Artists', count: 1 },
    { id: 'albums', label: 'Albums', count: 1 },
  ];

  return (
    <ScrollView bg={bgColor} flex={1}>
      {/* Header */}
      <Box bg="secondary.500" pt={12} pb={6}>
        <VStack space={4} mx={4}>
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              📚 Your Library
            </Text>
            <HStack space={3}>
              <Pressable>
                <Text fontSize="lg" color="white">🔍</Text>
              </Pressable>
              <Pressable>
                <Text fontSize="lg" color="white">➕</Text>
              </Pressable>
            </HStack>
          </HStack>

          {/* Search Bar */}
          <Input
            placeholder="Find in your library"
            value={searchQuery}
            onChangeText={setSearchQuery}
            bg="white"
            borderRadius="full"
            py={3}
            px={4}
            fontSize="md"
            _focus={{
              borderColor: 'primary.500',
              bg: 'white',
            }}
          />
        </VStack>
      </Box>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} py={4}>
        <HStack space={3} px={4}>
          {filters.map((filter) => (
            <Pressable
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Box
                px={4}
                py={2}
                rounded="full"
                bg={selectedFilter === filter.id ? 'primary.500' : cardBg}
                borderWidth={1}
                borderColor={selectedFilter === filter.id ? 'primary.500' : 'gray.200'}
              >
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={selectedFilter === filter.id ? 'white' : 'gray.600'}
                >
                  {filter.label} ({filter.count})
                </Text>
              </Box>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>

      {/* Recently Played */}
      <VStack space={4} mx={4} mb={6}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            Recently Played
          </Text>
          <Pressable>
            <Text fontSize="sm" color="primary.500" fontWeight="medium">
              View All
            </Text>
          </Pressable>
        </HStack>

        <Box bg={cardBg} rounded="xl" shadow={1} overflow="hidden">
          <VStack space={0}>
            {recentlyPlayed.map((item, index) => (
              <Pressable key={item.id}>
                <HStack
                  alignItems="center"
                  space={3}
                  p={4}
                  borderBottomWidth={index < recentlyPlayed.length - 1 ? 1 : 0}
                  borderBottomColor="gray.100"
                >
                  <Image
                    source={{ uri: item.image }}
                    alt={item.title}
                    size={12}
                    rounded="md"
                  />
                  <VStack flex={1} space={1}>
                    <Text fontSize="md" fontWeight="semibold" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500" numberOfLines={1}>
                      {item.artist} • {item.playedAt}
                    </Text>
                  </VStack>
                  <Text fontSize="lg">⋯</Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </VStack>

      {/* Library Items */}
      <VStack space={4} mx={4} mb={8}>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Your Music
        </Text>

        <VStack space={3}>
          {libraryItems.map((item) => (
            <Pressable key={item.id}>
              <HStack alignItems="center" space={4} p={3} rounded="lg">
                <Box position="relative">
                  {item.gradient && item.type === 'playlist' ? (
                    <Box
                      size={16}
                      bg="gradient(to-br, #667eea, #764ba2)"
                      rounded="md"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl">❤️</Text>
                    </Box>
                  ) : (
                    <Image
                      source={{ uri: item.image }}
                      alt={item.title}
                      size={16}
                      rounded={item.type === 'artist' ? 'full' : 'md'}
                    />
                  )}
                  {item.type === 'playlist' && (
                    <Badge
                      position="absolute"
                      bottom={-1}
                      right={-1}
                      bg="success.500"
                      rounded="full"
                      px={1}
                      py={0}
                      _text={{ fontSize: 'xs', color: 'white' }}
                    >
                      {item.count}
                    </Badge>
                  )}
                </Box>
                <VStack flex={1} space={1}>
                  <Text fontSize="md" fontWeight="semibold" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500" numberOfLines={1}>
                    {item.type === 'playlist' 
                      ? `Playlist • ${item.count} songs`
                      : item.type === 'album'
                      ? `Album • ${item.artist}`
                      : `Artist • ${item.count} songs`
                    }
                  </Text>
                </VStack>
                <HStack alignItems="center" space={2}>
                  <Pressable>
                    <Text fontSize="lg">📥</Text>
                  </Pressable>
                  <Text fontSize="lg">⋯</Text>
                </HStack>
              </HStack>
            </Pressable>
          ))}
        </VStack>
      </VStack>

      {/* Made for You */}
      <VStack space={4} mx={4} mb={8}>
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Made for You
        </Text>
        <HStack space={4}>
          <Box flex={1} bg="gradient(to-r, #667eea, #764ba2)" rounded="xl" p={6}>
            <VStack space={2}>
              <Text fontSize="sm" color="white" opacity={0.8}>
                DISCOVER WEEKLY
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                Your weekly mix
              </Text>
              <Text fontSize="sm" color="white" opacity={0.9}>
                30 songs • Updated Mon
              </Text>
            </VStack>
          </Box>
          <Box flex={1} bg="gradient(to-r, #f093fb, #f5576c)" rounded="xl" p={6}>
            <VStack space={2}>
              <Text fontSize="sm" color="white" opacity={0.8}>
                DAILY MIX
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                Your favorites
              </Text>
              <Text fontSize="sm" color="white" opacity={0.9}>
                25 songs • Daily update
              </Text>
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </ScrollView>
  );
};

export default LibraryScreen;
