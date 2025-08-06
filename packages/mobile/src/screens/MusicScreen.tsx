import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Pressable,
  Slider,
  useColorModeValue,
  Center,
  Spacer,
} from 'native-base';

const MusicScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45);
  const [duration] = useState(210); // 3:30
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSong = {
    title: 'Midnight Dreams',
    artist: 'Luna Sky',
    album: 'Cosmic Journey',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  };

  return (
    <Box bg={bgColor} flex={1}>
      {/* Header */}
      <HStack alignItems="center" justifyContent="space-between" p={4} pt={12}>
        <Pressable>
          <Text fontSize="lg">⌄</Text>
        </Pressable>
        <VStack alignItems="center">
          <Text fontSize="sm" color="gray.500" textTransform="uppercase">
            Playing from
          </Text>
          <Text fontSize="md" fontWeight="semibold">
            Your Library
          </Text>
        </VStack>
        <Pressable>
          <Text fontSize="lg">⋯</Text>
        </Pressable>
      </HStack>

      <VStack flex={1} px={6} py={8} space={6}>
        {/* Album Art */}
        <Center>
          <Box
            w={320}
            h={320}
            rounded="3xl"
            overflow="hidden"
            shadow={8}
            bg={cardBg}
          >
            <Image
              source={{ uri: currentSong.image }}
              alt={currentSong.title}
              w="full"
              h="full"
              resizeMode="cover"
            />
          </Box>
        </Center>

        {/* Song Info */}
        <VStack space={2} alignItems="center">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center" numberOfLines={2}>
            {currentSong.title}
          </Text>
          <Text fontSize="lg" color="gray.500" textAlign="center">
            {currentSong.artist}
          </Text>
        </VStack>

        {/* Progress Bar */}
        <VStack space={3}>
          <Slider
            defaultValue={currentTime}
            maxValue={duration}
            colorScheme="primary"
            size="sm"
            onChange={(value) => setCurrentTime(Math.round(value))}
          >
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.400">
              {formatTime(currentTime)}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {formatTime(duration)}
            </Text>
          </HStack>
        </VStack>

        {/* Controls */}
        <VStack space={6}>
          {/* Secondary Controls */}
          <HStack alignItems="center" justifyContent="space-between" px={4}>
            <Pressable
              onPress={() => setIsShuffled(!isShuffled)}
              opacity={isShuffled ? 1 : 0.5}
            >
              <Text fontSize="xl">🔀</Text>
            </Pressable>
            <Pressable onPress={() => setIsLiked(!isLiked)}>
              <Text fontSize="xl">{isLiked ? '❤️' : '🤍'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setRepeatMode((repeatMode + 1) % 3)}
              opacity={repeatMode > 0 ? 1 : 0.5}
            >
              <Text fontSize="xl">
                {repeatMode === 2 ? '🔂' : '🔁'}
              </Text>
            </Pressable>
          </HStack>

          {/* Main Controls */}
          <HStack alignItems="center" justifyContent="center" space={8}>
            <Pressable>
              <Text fontSize="3xl">⏮️</Text>
            </Pressable>
            <Pressable
              onPress={() => setIsPlaying(!isPlaying)}
              bg="primary.500"
              rounded="full"
              p={6}
              shadow={4}
            >
              <Text fontSize="4xl" color="white">
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </Pressable>
            <Pressable>
              <Text fontSize="3xl">⏭️</Text>
            </Pressable>
          </HStack>
        </VStack>

        <Spacer />

        {/* Volume Control */}
        <VStack space={3}>
          <HStack alignItems="center" space={3}>
            <Text fontSize="md">🔈</Text>
            <Slider
              flex={1}
              defaultValue={volume}
              maxValue={100}
              colorScheme="gray"
              size="sm"
              onChange={(value) => setVolume(Math.round(value))}
            >
              <Slider.Track>
                <Slider.FilledTrack />
              </Slider.Track>
              <Slider.Thumb />
            </Slider>
            <Text fontSize="md">🔊</Text>
          </HStack>
        </VStack>

        {/* Queue Info */}
        <HStack alignItems="center" justifyContent="center" space={4} py={4}>
          <Pressable>
            <HStack alignItems="center" space={2}>
              <Text fontSize="md">📋</Text>
              <Text fontSize="md" color="primary.500" fontWeight="medium">
                Queue
              </Text>
            </HStack>
          </Pressable>
          <Text color="gray.300">•</Text>
          <Pressable>
            <HStack alignItems="center" space={2}>
              <Text fontSize="md">🎵</Text>
              <Text fontSize="md" color="primary.500" fontWeight="medium">
                Lyrics
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );
};

export default MusicScreen;
