import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Progress,
  useToast,
  Spinner,
  Center,
  Image,
  SimpleGrid
} from '@chakra-ui/react';
import type { GameSession, GameSetting, GameQuestion } from '../types/game';
import { useGameApi } from '../hooks/useGameApi';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import StreetView from './StreetView';
import GameMap from './GameMap';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameSession: GameSession | null;
  gameSetting: GameSetting | null;
  gameMode: 'MY_MEMORIES' | 'MEMORIES_RANDOM' | 'RANDOM';
}

const GameModal: React.FC<GameModalProps> = ({
  isOpen,
  onClose,
  gameSession,
  gameSetting,
  gameMode
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameQuestion, setCurrentGameQuestion] = useState<GameQuestion | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<GameQuestion | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState<{ lat: number; lng: number } | null>(null);
  const toast = useToast();
  const { getNextQuestion, submitAnswer, giveUpGame, decryptCoordinate } = useGameApi();
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps();
  
  const maxQuestions = gameSetting?.maxQuestions || 10;

  // 게임 시작 시 첫 번째 문제 가져오기
  useEffect(() => {
    if (isOpen && gameSession) {
      setCurrentQuestion(1);
      setScore(0);
      setCurrentGameQuestion(null);
      setQuestionStartTime(null);
      setIsGameCompleted(false);
      setShowResult(false);
      setLastAnswerResult(null);
      setPlayerAnswer(null);
      
      loadNextQuestion();
    }
  }, [isOpen, gameSession]);

  const loadNextQuestion = async () => {
    if (!gameSession) return;
    
    try {
      setQuestionLoading(true);
      // 이전 답안 정보 초기화
      setPlayerAnswer(null);
      setShowResult(false);
      setLastAnswerResult(null);
      
      const question = await getNextQuestion(gameSession.id);
      
      if (question) {
        setCurrentGameQuestion(question);
        setQuestionStartTime(new Date());
      } else {
        toast({
          title: '문제 로드 실패',
          description: '다음 문제를 가져올 수 없습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading next question:', error);
    } finally {
      setQuestionLoading(false);
    }
  };

  const getGameModeTitle = () => {
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

  const getGameModeDescription = () => {
    switch (gameMode) {
      case 'MY_MEMORIES':
        return '내가 저장한 추억의 위치를 맞춰보세요!';
      case 'MEMORIES_RANDOM':
        return '무작위 추억의 위치를 맞춰보세요!';
      case 'RANDOM':
        return '거리뷰를 보고 위치를 맞춰보세요!';
      default:
        return '';
    }
  };

  const handleAnswerSubmit = async (selectedLocation: { lat: number; lng: number }) => {
    if (!gameSession || !currentGameQuestion || !questionStartTime) {
      toast({
        title: '오류 발생',
        description: '게임 세션 또는 문제 정보가 없습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const timeTaken = Math.round((new Date().getTime() - questionStartTime.getTime()) / 1000);
      
      const answerResult = await submitAnswer(
        gameSession.id,
        currentGameQuestion.id,
        {
          playerLatitude: selectedLocation.lat,
          playerLongitude: selectedLocation.lng,
          timeTakenSeconds: timeTaken
        }
      );
      
      if (answerResult) {
        // 답안 결과 저장
        setLastAnswerResult(answerResult);
        setPlayerAnswer(selectedLocation);
        setShowResult(true);
        
        // 점수 업데이트
        setScore(prev => prev + answerResult.score);
        
        toast({
          title: '답안 제출 완료!',
          description: `${answerResult.score}점을 획득했습니다! (거리: ${answerResult.distanceKm?.toFixed(2)}km)`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: '답안 제출 실패',
          description: '답안을 제출할 수 없습니다. 다시 시도해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '답안 제출 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameEnd = () => {
    toast({
      title: '게임 완료!',
      description: `총 점수: ${score}점`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    onClose();
  };

  const handleNextQuestion = async () => {
    if (!lastAnswerResult) return;
    
    // 결과 화면 닫기
    setShowResult(false);
    setLastAnswerResult(null);
    setPlayerAnswer(null);
    
    // 게임 완료 체크
    if (lastAnswerResult.isGameSessionCompleted) {
      setIsGameCompleted(true);
      return;
    }

    // 다음 문제로 이동
    const nextQuestionNumber = currentQuestion + 1;
    setCurrentQuestion(nextQuestionNumber);
    
    if (nextQuestionNumber <= maxQuestions) {
      await loadNextQuestion();
    } else {
      setIsGameCompleted(true);
    }
  };

  const handleGameGiveUp = async () => {
    if (!gameSession) {
      onClose();
      return;
    }

    if (isGameCompleted) {
      onClose();
      return;
    }

    try {
      const confirmed = window.confirm('정말로 게임을 포기하시겠습니까? 현재까지의 진행 상황이 저장되지 않습니다.');
      
      if (!confirmed) {
        return;
      }

      const success = await giveUpGame(gameSession.id);
      
      if (success) {
        toast({
          title: '게임 포기',
          description: '게임을 포기하셨습니다.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: '게임 포기 실패',
          description: '게임 포기 중 오류가 발생했습니다. 다시 시도해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error giving up game:', error);
      toast({
        title: '오류 발생',
        description: '게임 포기 중 예상치 못한 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loadError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Google Maps 로드 오류</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center h="50vh">
              <VStack>
                <Text fontSize="xl" color="red.500">Google Maps API를 로드할 수 없습니다</Text>
                <Text color="gray.600">인터넷 연결과 API 키를 확인해주세요</Text>
                <Button onClick={onClose}>닫기</Button>
              </VStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleGameGiveUp} size="full" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="white" borderBottom="1px" borderColor="gray.200">
          <VStack spacing={3} align="start">
            <HStack justify="space-between" w="100%">
              <Text fontSize="xl" fontWeight="bold">
                {getGameModeTitle()}
              </Text>
              <Badge colorScheme="blue" fontSize="sm">
                세션 ID: {gameSession?.id}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {getGameModeDescription()}
            </Text>
            <HStack spacing={6} w="100%">
              <Text fontSize="sm" fontWeight="medium">
                문제: {currentQuestion} / {maxQuestions}
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                점수: {score}점
              </Text>
            </HStack>
            <Progress value={(currentQuestion - 1) * (100 / maxQuestions)} w="100%" colorScheme="blue" size="sm" />
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0} bg="gray.50" overflow="hidden">
          {!isGoogleMapsLoaded ? (
            <Center h="calc(100vh - 200px)" bg="white">
              <VStack spacing={4}>
                <Spinner size="xl" />
                <Text>Google Maps를 로딩하는 중...</Text>
              </VStack>
            </Center>
          ) : isLoading || questionLoading || !currentGameQuestion ? (
            <Center h="calc(100vh - 200px)" bg="white">
              <VStack spacing={4}>
                <Spinner size="xl" />
                <Text>
                  {questionLoading ? '문제를 로드하는 중...' : 
                   !currentGameQuestion ? '문제 데이터를 기다리는 중...' : 
                   '답안을 처리하는 중...'}
                </Text>
              </VStack>
            </Center>
          ) : (!isGameCompleted && currentQuestion <= maxQuestions && currentGameQuestion) ? (
            <Box h="calc(100vh - 200px)" display="flex">
              {/* 왼쪽: 문제 영역 */}
              <Box w="50%" p={6} bg="white" borderRight="1px" borderColor="gray.200">
                <VStack spacing={4} h="100%">
                  <Box w="100%" flex="1" borderRadius="lg" overflow="hidden">
                    {gameMode === 'RANDOM' ? (
                      <Box h="100%">
                        <StreetView 
                          isLoaded={isGoogleMapsLoaded}
                          lat={decryptCoordinate(currentGameQuestion.encryptCorrectLatitude)}
                          lng={decryptCoordinate(currentGameQuestion.encryptCorrectLongitude)}
                          height="100%"
                        />
                      </Box>
                    ) : (
                      <VStack spacing={4} h="100%">
                        {currentGameQuestion.memoryImageUrls && currentGameQuestion.memoryImageUrls.length > 0 ? (
                          <Box flex="1" w="100%">
                            <Text fontSize="sm" fontWeight="bold" mb={2} color="blue.600">
                              📷 추억 사진
                            </Text>
                            <SimpleGrid 
                              columns={currentGameQuestion.memoryImageUrls.length === 1 ? 1 : 2} 
                              spacing={2} 
                              h="calc(50% - 20px)"
                            >
                              {currentGameQuestion.memoryImageUrls.map((url, index) => (
                                <Image 
                                  key={index}
                                  src={url} 
                                  alt={`추억 사진 ${index + 1}`}
                                  objectFit="cover"
                                  w="100%"
                                  h="100%"
                                  borderRadius="md"
                                />
                              ))}
                            </SimpleGrid>
                          </Box>
                        ) : null}
                        
                        <Box flex="1" w="100%">
                          <Text fontSize="sm" fontWeight="bold" mb={2} color="green.600">
                            🌍 거리뷰
                          </Text>
                          <StreetView 
                            isLoaded={isGoogleMapsLoaded}
                            lat={decryptCoordinate(currentGameQuestion.encryptCorrectLatitude)}
                            lng={decryptCoordinate(currentGameQuestion.encryptCorrectLongitude)}
                            height="calc(100% - 30px)"
                          />
                        </Box>
                      </VStack>
                    )}
                  </Box>
                  
                  <Box w="100%" p={4} bg="blue.50" borderRadius="lg">
                    <VStack spacing={2}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.700">
                        📝 힌트
                      </Text>
                      <Text fontSize="sm" color="gray.700" textAlign="center">
                        {gameMode === 'RANDOM' 
                          ? '이 거리뷰의 위치를 오른쪽 지도에서 찾아보세요!'
                          : '이 추억이 만들어진 위치를 오른쪽 지도에서 찾아보세요!'
                        }
                      </Text>
                      <Badge colorScheme="orange" fontSize="xs">
                        문제 {currentGameQuestion ? currentGameQuestion.questionOrder + 1 : currentQuestion} / {maxQuestions}
                      </Badge>
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              {/* 오른쪽: 지도 영역 */}
              <Box w="50%" p={6} bg="gray.50">
                <VStack spacing={4} h="100%">
                  <Box w="100%" flex="1" borderRadius="lg" overflow="hidden">
                    <GameMap
                      isLoaded={isGoogleMapsLoaded}
                      onLocationSelect={handleAnswerSubmit}
                      height="100%"
                      showResult={showResult}
                      correctLocation={currentGameQuestion && showResult ? {
                        lat: decryptCoordinate(currentGameQuestion.encryptCorrectLatitude),
                        lng: decryptCoordinate(currentGameQuestion.encryptCorrectLongitude)
                      } : undefined}
                      playerLocation={playerAnswer}
                      isSubmitted={isLoading}
                      resultData={lastAnswerResult ? {
                        distance: lastAnswerResult.distanceKm || 0,
                        score: lastAnswerResult.score
                      } : undefined}
                    />
                  </Box>
                  
                  {/* 결과 표시 시 다음 문제 버튼 */}
                  {showResult && (
                    <VStack spacing={3} w="100%">
                      <Box bg="white" p={4} borderRadius="xl" boxShadow="lg" w="100%">
                        <VStack spacing={2}>
                          <Text fontSize="lg" fontWeight="bold" color="gray.700">
                            🎯 결과 확인
                          </Text>
                          <HStack spacing={4} justify="center">
                            <VStack spacing={1}>
                              <Text fontSize="sm" color="blue.600" fontWeight="bold">
                                📍 정답 위치
                              </Text>
                              <Box w={4} h={4} bg="#0066FF" borderRadius="full" border="2px solid white" />
                            </VStack>
                            <VStack spacing={1}>
                              <Text fontSize="sm" color="green.600" fontWeight="bold">
                                📋 내 답안
                              </Text>
                              <Box w={4} h={4} bg="#00AA00" borderRadius="full" border="2px solid white" />
                            </VStack>
                            <VStack spacing={1}>
                              <Text fontSize="sm" color="red.500" fontWeight="bold">
                                📏 거리
                              </Text>
                              <Box w={6} h={1} bg="#FF6B6B" borderRadius="sm" />
                            </VStack>
                          </HStack>
                          {lastAnswerResult && (
                            <VStack spacing={1} mt={2}>
                              <Text fontSize="md" fontWeight="bold" color="red.500">
                                📏 거리: {lastAnswerResult.distanceKm?.toFixed(2)}km
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                🎯 획득 점수: {lastAnswerResult.score}점
                              </Text>
                            </VStack>
                          )}
                        </VStack>
                      </Box>
                      
                      <Button
                        colorScheme="blue"
                        size="lg"
                        w="100%"
                        onClick={handleNextQuestion}
                        isLoading={questionLoading}
                        loadingText="다음 문제 로드 중..."
                        fontWeight="bold"
                        py={6}
                        leftIcon={<span>➡️</span>}
                      >
                        다음 문제
                      </Button>
                    </VStack>
                  )}
                </VStack>
              </Box>
            </Box>
          ) : (
            <Center h="calc(100vh - 200px)" bg="white">
              <VStack spacing={6}>
                <Text fontSize="3xl" fontWeight="bold">🎉 게임 완료!</Text>
                <Box p={8} bg="blue.50" borderRadius="xl" textAlign="center">
                  <VStack spacing={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">총 점수: {score}점</Text>
                    <Text fontSize="lg" color="gray.600">
                      게임 완료!
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {currentQuestion - 1}문제 완료 • 세션 ID: {gameSession?.id}
                    </Text>
                  </VStack>
                </Box>
                <Button colorScheme="blue" size="lg" onClick={handleGameEnd}>
                  결과 확인
                </Button>
              </VStack>
            </Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GameModal;