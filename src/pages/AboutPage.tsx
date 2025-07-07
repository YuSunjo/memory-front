import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Button,
  Badge,
  HStack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FaHeart, 
  FaCamera, 
  FaCalendarAlt, 
  FaUsers, 
  FaMapMarkerAlt, 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const features = [
    {
      icon: FaHeart,
      title: "추억 저장",
      description: "소중한 순간들을 아름다운 메모리로 저장하고 관리하세요",
      color: "red.500"
    },
    {
      icon: FaCamera,
      title: "사진 & 동영상",
      description: "다양한 미디어 파일로 추억을 더욱 생생하게 기록하세요",
      color: "blue.500"
    },
    {
      icon: FaCalendarAlt,
      title: "캘린더 연동",
      description: "일정 관리와 함께 추억을 날짜별로 체계적으로 정리하세요",
      color: "green.500"
    },
    {
      icon: FaUsers,
      title: "관계 관리",
      description: "가족, 친구, 연인과 함께한 추억을 관계별로 분류하고 공유하세요",
      color: "purple.500"
    },
    {
      icon: FaMapMarkerAlt,
      title: "위치 기반",
      description: "지도 기능으로 추억이 만들어진 장소를 기록하고 다시 찾아보세요",
      color: "orange.500"
    }
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        {/* 헤더 섹션 */}
        <VStack spacing={8} mb={16} textAlign="center">
          <Box>
            <Badge colorScheme="blue" fontSize="lg" px={4} py={2} borderRadius="full">
              🌟 추억을 소중히 저장하는 공간
            </Badge>
          </Box>
          
          <VStack spacing={4}>
            <Heading 
              size="3xl" 
              bgGradient="linear(to-r, blue.400, purple.500, pink.400)" 
              bgClip="text"
              fontWeight="bold"
            >
              Memory
            </Heading>
            <Text fontSize="2xl" color="gray.600" maxW="800px" lineHeight="tall">
              당신의 소중한 순간들을 아름답게 기록하고, 
              <Text as="span" color="blue.500" fontWeight="semibold"> 영원히 간직</Text>할 수 있는 
              디지털 추억 저장소입니다.
            </Text>
          </VStack>

          <HStack spacing={4}>
            <Button 
              colorScheme="blue" 
              size="lg" 
              px={8}
              onClick={() => navigate('/signup')}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              지금 시작하기
            </Button>
            <Button 
              variant="outline" 
              colorScheme="blue" 
              size="lg" 
              px={8}
              onClick={() => navigate('/login')}
              _hover={{ transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              로그인
            </Button>
          </HStack>
        </VStack>

        <Divider mb={16} />

        {/* 주요 기능 소개 */}
        <VStack spacing={12} mb={16}>
          <Heading size="xl" textAlign="center" color="gray.700">
            주요 기능
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="100%">
            {features.map((feature, index) => (
              <Card 
                key={index}
                bg={cardBg}
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{ 
                  transform: "translateY(-5px)", 
                  boxShadow: "xl",
                  borderColor: feature.color
                }}
                border="1px"
                borderColor="gray.200"
              >
                <CardBody p={6}>
                  <VStack spacing={4} align="start">
                    <Box 
                      p={3} 
                      borderRadius="lg" 
                      bg={`${feature.color.split('.')[0]}.50`}
                    >
                      <Icon as={feature.icon} boxSize={6} color={feature.color} />
                    </Box>
                    <Heading size="md" color="gray.700">
                      {feature.title}
                    </Heading>
                    <Text color="gray.600" lineHeight="tall">
                      {feature.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>

        {/* 스크린샷/이미지 섹션 */}
        <VStack spacing={8} mb={16} textAlign="center">
          <Text fontSize="lg" color="gray.600" maxW="600px">
            사용하기 쉬운 디자인으로 누구나 쉽게 추억을 관리할 수 있습니다.
          </Text>
          
          <Box 
            w="100%" 
            h="400px" 
            bg="gradient.100" 
            borderRadius="xl" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            border="2px dashed"
            borderColor="gray.300"
          >
            <VStack spacing={4}>
              <Icon as={FaCamera} boxSize={12} color="gray.400" />
              <Text color="gray.500" fontSize="lg">
                서비스 스크린샷 예정
              </Text>
            </VStack>
          </Box>
        </VStack>

      </Container>
    </Box>
  );
};

export default AboutPage;