import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  SimpleGrid,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FaGamepad, FaMapMarkerAlt, FaDice, FaStreetView } from 'react-icons/fa';
import GameModal from '../components/GameModal';
import { useGameApi } from '../hooks/useGameApi';
import useAuth from '../hooks/useAuth';
import type { GameSession, GameSetting } from '../types/game';

const MemoryQuestPage: React.FC = () => {
  // 인증 확인 - 로그인이 필요한 페이지
  const { isAuthenticated, isLoading } = useAuth(true, '/login');
  
  const bgGradient = useColorModeValue('linear(to-r, blue.400, purple.500)', 'linear(to-r, blue.600, purple.700)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const { createGameSession, loading } = useGameApi();
  
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [currentGameSession, setCurrentGameSession] = useState<GameSession | null>(null);
  const [currentGameSetting, setCurrentGameSetting] = useState<GameSetting | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM'>('MY_MEMORIES');

  const handleStartGame = async (gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM') => {
    try {
      const result = await createGameSession(gameMode);
      
      if (result) {
        setCurrentGameSession(result.gameSession);
        setCurrentGameSetting(result.gameSetting);
        setSelectedGameMode(gameMode);
        setIsGameModalOpen(true);
        
        toast({
          title: '게임 세션 생성 완료!',
          description: `${getGameModeTitle(gameMode)} 게임을 시작합니다. (총 ${result.gameSetting.maxQuestions}문제)`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: '게임 시작 실패',
          description: '게임 세션을 생성할 수 없습니다. 다시 시도해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const getGameModeTitle = (gameMode: string) => {
    switch (gameMode) {
      case 'MY_MEMORIES':
        return '내 추억 퀘스트';
      case 'MEMORIES_RANDOM':
        return '랜덤 추억 퀘스트';
      case 'RANDOM':
        return '랜덤 퀘스트';
      default:
        return 'Memory Quest';
    }
  };

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false);
    setCurrentGameSession(null);
    setCurrentGameSetting(null);
  };

  // 인증 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center" justify="center" minH="50vh">
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3182ce',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
          }} />
          <Text fontSize="lg" color="gray.600">
            로그인 상태를 확인하는 중...
          </Text>
        </VStack>
      </Container>
    );
  }

  // 인증되지 않은 경우 (useAuth에서 자동 리다이렉트 처리되지만 대기 중인 경우)
  if (!isAuthenticated) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center" justify="center" minH="50vh">
          <Icon as={FaGamepad} w={16} h={16} color="gray.400" />
          <Text fontSize="xl" fontWeight="bold" color="gray.600">
            로그인이 필요한 서비스입니다
          </Text>
          <Text color="gray.500" textAlign="center">
            Memory Quest를 이용하려면 로그인해주세요.
          </Text>
          <Button colorScheme="blue" size="lg" onClick={() => window.location.href = '/login'}>
            로그인 하러 가기
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 헤더 섹션 */}
        <Box
          bgGradient={bgGradient}
          borderRadius="xl"
          p={8}
          color="white"
          textAlign="center"
        >
          <VStack spacing={4}>
            <Icon as={FaGamepad} w={12} h={12} />
            <Heading size="xl">🗺️ Memory Quest</Heading>
            <Text fontSize="lg" opacity={0.9}>
              추억의 장소를 맞춰보세요! 나의 추억과 친구들의 추억을 보고 어느 지역인지 추측해보는 게임입니다.
            </Text>
          </VStack>
        </Box>

        {/* 게임 모드 선택 */}
        <VStack spacing={6} align="stretch">
          <Heading size="lg" textAlign="center">게임 모드 선택</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
            {/* 내 추억 모드 */}
            <Card 
              bg={cardBg} 
              shadow="lg" 
              borderRadius="xl" 
              _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
              transition="all 0.3s"
              cursor="pointer"
            >
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Icon as={FaMapMarkerAlt} w={8} h={8} color="blue.500" />
                  <Heading size="md">내 추억 퀘스트</Heading>
                  <Text textAlign="center" color="gray.600">
                    내가 저장한 추억들의 위치를 맞춰보세요
                  </Text>
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                    개인 모드
                  </Badge>
                  <Button colorScheme="blue" w="full" size="lg" 
                    onClick={() => handleStartGame('MY_MEMORIES')}
                    isLoading={loading}
                  >
                    게임 시작
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* 친구 추억 모드 - 주석 처리
            <Card 
              bg={cardBg} 
              shadow="lg" 
              borderRadius="xl" 
              _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
              transition="all 0.3s"
              cursor="pointer"
            >
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Icon as={FaTrophy} w={8} h={8} color="purple.500" />
                  <Heading size="md">친구 추억 챌린지</Heading>
                  <Text textAlign="center" color="gray.600">
                    친구들이 공유한 추억의 위치를 맞춰보세요
                  </Text>
                  <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                    소셜 모드
                  </Badge>
                  <Button colorScheme="purple" w="full" size="lg">
                    챌린지 시작
                  </Button>
                </VStack>
              </CardBody>
            </Card>
            */}

            {/* 랜덤 추억 퀘스트 */}
            <Card 
              bg={cardBg} 
              shadow="lg" 
              borderRadius="xl" 
              _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
              transition="all 0.3s"
              cursor="pointer"
            >
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Icon as={FaDice} w={8} h={8} color="orange.500" />
                  <Heading size="md">랜덤 추억 퀘스트</Heading>
                  <Text textAlign="center" color="gray.600">
                    무작위로 선택된 추억의 위치를 맞춰보세요
                  </Text>
                  <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>
                    랜덤 모드
                  </Badge>
                  <Button colorScheme="orange" w="full" size="lg"
                    onClick={() => handleStartGame('MEMORIES_RANDOM')}
                    isLoading={loading}
                  >
                    퀘스트 시작
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* 랜덤 퀘스트 (거리뷰) */}
            <Card 
              bg={cardBg} 
              shadow="lg" 
              borderRadius="xl" 
              w={{ base: "100%", md: "300px" }}
              _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
              transition="all 0.3s"
              cursor="pointer"
            >
              <CardBody p={6}>
                <VStack spacing={4} align="center">
                  <Icon as={FaStreetView} w={8} h={8} color="green.500" />
                  <Heading size="md">랜덤 퀘스트</Heading>
                  <Text textAlign="center" color="gray.600">
                    무작위 거리뷰를 보고 위치를 맞춰보세요
                  </Text>
                  <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                    거리뷰 모드
                  </Badge>
                  <Button colorScheme="green" w="full" size="lg"
                    onClick={() => handleStartGame('RANDOM')}
                    isLoading={loading}
                  >
                    도전하기
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>

        {/* 게임 설명 */}
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="md">
          <VStack spacing={4} align="start">
            <Heading size="md">🎯 게임 방법</Heading>
            <VStack spacing={3} align="start">
              <HStack>
                <Text fontWeight="bold" color="blue.500">1.</Text>
                <Text>게임 모드를 선택하세요:</Text>
              </HStack>
              <VStack spacing={2} align="start" pl={6}>
                <Text fontSize="sm" color="gray.600">• <Text as="span" fontWeight="bold" color="blue.500">내 추억 퀘스트</Text>: 내가 저장한 추억들의 위치 맞추기</Text>
                <Text fontSize="sm" color="gray.600">• <Text as="span" fontWeight="bold" color="orange.500">랜덤 추억 퀘스트</Text>: 무작위로 선택된 추억의 위치 맞추기</Text>
                <Text fontSize="sm" color="gray.600">• <Text as="span" fontWeight="bold" color="green.500">랜덤 퀘스트</Text>: 무작위 거리뷰를 보고 위치 맞추기</Text>
              </VStack>
              <HStack>
                <Text fontWeight="bold" color="blue.500">2.</Text>
                <Text>이미지나 거리뷰를 자세히 관찰하세요</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold" color="blue.500">3.</Text>
                <Text>지도에서 예상 위치를 클릭하세요</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold" color="blue.500">4.</Text>
                <Text>정답과의 거리에 따라 점수를 획득합니다</Text>
              </HStack>
              <HStack>
                <Text fontWeight="bold" color="blue.500">5.</Text>
                <Text>더 많은 퀘스트에 도전해서 높은 점수를 달성해보세요!</Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* 최근 기록 */}
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="md">
          <VStack spacing={4} align="start">
            <Heading size="md">🏆 최근 기록</Heading>
            <Text color="gray.600">아직 게임 기록이 없습니다. 첫 번째 게임을 시작해보세요!</Text>
          </VStack>
        </Box>
      </VStack>
      
      {/* 게임 모달 */}
      <GameModal
        isOpen={isGameModalOpen}
        onClose={handleCloseGameModal}
        gameSession={currentGameSession}
        gameSetting={currentGameSetting}
        gameMode={selectedGameMode}
      />
      
      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default MemoryQuestPage;