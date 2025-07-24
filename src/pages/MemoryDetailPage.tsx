import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Avatar,
  Button,
  IconButton,
  Flex,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import useMemoryService from '../hooks/useMemoryService';
import useMemberStore from '../store/memberStore';
import ReadOnlyMap from '../components/ReadOnlyMap';
import { CommentList } from '../components/comments';
import type {MemoryResponse} from "../types";

const MemoryDetailPage: React.FC = () => {
  const { memoryId } = useParams<{ memoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { member: currentUser } = useMemberStore();
  
  const [memory, setMemory] = useState<MemoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { getMemoryById, getPublicMemoryById, deleteMemory } = useMemoryService();
  
  // URL 검색 매개변수에서 source 확인
  const searchParams = new URLSearchParams(location.search);
  const source = searchParams.get('source'); // 'sharing' 또는 null

  useEffect(() => {
    if (memoryId) {
      loadMemory();
    }
  }, [memoryId]);

  const loadMemory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let memoryData;
      // sharing memories에서 온 경우 public API 사용
      if (source === 'sharing') {
        memoryData = await getPublicMemoryById(parseInt(memoryId!));
      } else {
        // 나머지 경우 일반 API 사용
        memoryData = await getMemoryById(parseInt(memoryId!));
      }
      
      setMemory(memoryData);
    } catch (err) {
      setError('메모리를 불러오는데 실패했습니다.');
      console.error('Error loading memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    // 보안 강화: 소유자가 아닌 경우 수정 방지
    if (!currentUser || currentUser.id !== memory?.member.id) {
      toast({
        title: '권한 없음',
        description: '자신의 메모리만 수정할 수 있습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    navigate(`/memory/${memoryId}/edit`);
  };

  const handleDelete = async () => {
    // 보안 강화: 소유자가 아닌 경우 삭제 방지
    if (!currentUser || currentUser.id !== memory?.member.id) {
      toast({
        title: '권한 없음',
        description: '자신의 메모리만 삭제할 수 있습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!confirm('정말로 이 메모리를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteMemory(parseInt(memoryId!));
      toast({
        title: '메모리 삭제됨',
        description: '메모리가 성공적으로 삭제되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(-1);
    } catch (err) {
      toast({
        title: '삭제 실패',
        description: '메모리 삭제에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNextImage = () => {
    if (memory && memory.files.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % memory.files.length);
    }
  };

  const handlePrevImage = () => {
    if (memory && memory.files.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + memory.files.length) % memory.files.length);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMemoryTypeLabel = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return '공개';
      case 'PRIVATE':
        return '비공개';
      case 'RELATIONSHIP':
        return '관계';
      default:
        return type;
    }
  };

  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'blue';
      case 'PRIVATE':
        return 'gray';
      case 'RELATIONSHIP':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>메모리를 불러오는 중...</Text>
      </Container>
    );
  }

  if (error || !memory) {
    return (
      <Container maxW="container.lg" centerContent py={10}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Text>{error || '메모리를 찾을 수 없습니다.'}</Text>
        </Alert>
        <Button onClick={handleGoBack} leftIcon={<ArrowBackIcon />}>
          돌아가기
        </Button>
      </Container>
    );
  }

  // 소유자 확인: 로그인한 사용자와 메모리 작성자가 동일한지 확인
  const isOwner = currentUser?.id === memory.member.id;
  const isAuthenticated = !!currentUser;
  // 로그인한 사용자이고 소유자인 경우에만 수정/삭제 버튼 표시 (소스와 무관)
  const showEditButtons = isAuthenticated && isOwner;

  // 지도 좌표 변환 함수
  const parseCoordinate = (coord: string): number => {
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        {/* 헤더 */}
        <Flex justify="space-between" align="center">
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={handleGoBack}
          >
            돌아가기
          </Button>
          
          {/* 로그인한 사용자이고 소유자인 경우에만 수정/삭제 버튼 표시 (소스와 무관) */}
          {showEditButtons && (
            <HStack spacing={2}>
              <IconButton
                aria-label="Edit memory"
                icon={<EditIcon />}
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleEdit}
                title="메모리 수정"
              />
              <IconButton
                aria-label="Delete memory"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={handleDelete}
                title="메모리 삭제"
              />
            </HStack>
          )}
        </Flex>

        <Box maxW="600px" mx="auto" w="100%">
          {/* 작성자 정보 */}
          <Flex p={4} align="center" justify="space-between" bg="white" borderRadius="lg" shadow="sm" mb={4}>
            <HStack spacing={3}>
              <Avatar 
                size="md" 
                name={memory.member.name || memory.member.nickname} 
                src={memory.member.profile?.fileUrl}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{memory.member.nickname || memory.member.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(memory.createDate)}
                </Text>
              </VStack>
            </HStack>
            
            <Badge 
              colorScheme={getMemoryTypeColor(memory.memoryType)}
              variant="subtle"
            >
              {getMemoryTypeLabel(memory.memoryType)}
            </Badge>
          </Flex>

          {/* 이미지 캐러셀 및 지도 */}
          {memory.files.length > 0 ? (
            <Box position="relative" mb={6}>
              <Image 
                src={memory.files[currentImageIndex].fileUrl} 
                alt={`Memory image ${currentImageIndex + 1}`} 
                width="100%" 
                height="auto"
                objectFit="cover"
                borderRadius="lg"
                shadow="md"
              />

              {/* 지도 오버레이 */}
              {memory.map && (
                <Box
                  position="absolute"
                  top="4"
                  right="4"
                  width="200px"
                  height="150px"
                  borderRadius="lg"
                  overflow="hidden"
                  border="2px solid white"
                  shadow="lg"
                  bg="white"
                >
                  <ReadOnlyMap
                    lat={parseCoordinate(memory.map.latitude)}
                    lng={parseCoordinate(memory.map.longitude)}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              )}

              {/* 위치 정보 표시 */}
              {memory.locationName && (
                <Box
                  position="absolute"
                  bottom="4"
                  left="4"
                  bg="blackAlpha.700"
                  color="white"
                  px={3}
                  py={2}
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  📍 {memory.locationName}
                </Box>
              )}

              {/* 네비게이션 화살표 */}
              {memory.files.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous image"
                    icon={<ArrowBackIcon />}
                    position="absolute"
                    left="4"
                    top="50%"
                    transform="translateY(-50%)"
                    borderRadius="full"
                    bg="whiteAlpha.800"
                    _hover={{ bg: 'whiteAlpha.900' }}
                    onClick={handlePrevImage}
                  />
                  <IconButton
                    aria-label="Next image"
                    icon={<ArrowBackIcon transform="rotate(180deg)" />}
                    position="absolute"
                    right="4"
                    top="50%"
                    transform="translateY(-50%)"
                    borderRadius="full"
                    bg="whiteAlpha.800"
                    _hover={{ bg: 'whiteAlpha.900' }}
                    onClick={handleNextImage}
                  />
                </>
              )}

              {/* 이미지 인디케이터 */}
              {memory.files.length > 1 && (
                <Flex position="absolute" bottom="4" width="100%" justify="center" gap={2}>
                  {memory.files.map((_, index) => (
                    <Box
                      key={index}
                      width="10px"
                      height="10px"
                      borderRadius="full"
                      bg={index === currentImageIndex ? "white" : "whiteAlpha.600"}
                      cursor="pointer"
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </Flex>
              )}
            </Box>
          ) : (
            /* 이미지가 없는 경우 */
            <Box mb={6}>
              <Flex 
                width="100%" 
                height="300px"
                bg="gray.100"
                align="center"
                justify="center"
                direction="column"
                color="gray.500"
                borderRadius="lg"
                border="2px dashed"
                borderColor="gray.300"
              >
                <Text fontSize="2xl" mb={2}>📷</Text>
                <Text fontSize="lg" fontWeight="medium">사진이 없습니다</Text>
              </Flex>
              
              {/* 지도가 있는 경우 지도 표시 */}
              {memory.map && (
                <Box mt={4}>
                  <Box
                    width="100%"
                    height="300px"
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.200"
                    shadow="md"
                    bg="white"
                  >
                    <ReadOnlyMap
                      lat={parseCoordinate(memory.map.latitude)}
                      lng={parseCoordinate(memory.map.longitude)}
                      zoom={15}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                  
                  {/* 위치 정보 */}
                  {memory.locationName && (
                    <Text
                      mt={3}
                      fontSize="sm"
                      color="gray.600"
                      textAlign="center"
                    >
                      📍 {memory.locationName}
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          )}
          

          {/* 메모리 내용 */}
          <Box bg="white" borderRadius="lg" shadow="sm" p={6}>
            {/* 제목 */}
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {memory.title}
            </Text>
            
            {/* 기억할만한 날짜 */}
            {memory.memorableDate && (
              <Text fontSize="sm" color="blue.600" fontWeight="medium" mb={4}>
                📅 {new Date(memory.memorableDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            )}
            
            <Text fontSize="lg" lineHeight="tall" whiteSpace="pre-wrap">
              {memory.content}
            </Text>
            
            {memory.updateDate !== memory.createDate && (
              <>
                <Divider my={4} />
                <Text fontSize="sm" color="gray.500" textAlign="right">
                  수정됨: {formatDate(memory.updateDate)}
                </Text>
              </>
            )}
          </Box>

          {/* 댓글 섹션 */}
          <CommentList 
            memoryId={parseInt(memoryId!)}
            initialCollapsed={false}
          />
        </Box>
      </VStack>
    </Container>
  );
};

export default MemoryDetailPage;