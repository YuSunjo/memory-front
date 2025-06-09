import React from 'react';
import { Container, Box, Heading, VStack, Button, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';

const MyMemoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateMemory = () => {
    navigate('/create-memory');
  };

  // Mock data for memories
  const memories = [
    {
      id: 1,
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
      ],
      description: '산에서 찍은 아름다운 풍경 사진입니다. 맑은 하늘과 푸른 산, 그리고 멀리 보이는 호수가 정말 인상적이었습니다. 이날은 날씨가 정말 좋았고, 등산로를 따라 올라가면서 다양한 식물과 동물들을 볼 수 있었습니다. 정상에 도착했을 때의 그 상쾌함은 정말 말로 표현할 수 없었습니다.',
      author: {
        id: 101,
        name: '김산악',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      likes: 124,
      comments: 15
    },
    {
      id: 2,
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      ],
      description: '해변에서의 아름다운 일몰 사진입니다. 파도 소리와 함께하는 저녁 시간이 너무 평화로웠습니다.',
      author: {
        id: 102,
        name: '이바다',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      likes: 89,
      comments: 7
    },
    {
      id: 3,
      images: [
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
      ],
      description: '도로 여행 중에 찍은 사진입니다. 끝없이 펼쳐진 도로와 양옆으로 펼쳐진 자연 경관이 정말 아름다웠습니다. 창문을 열고 바람을 맞으며 달리는 기분은 정말 최고였습니다. 중간에 멋진 전망대에서 잠시 쉬어가기도 했는데, 그곳에서 바라본 풍경은 정말 잊을 수 없을 것 같습니다.',
      author: {
        id: 103,
        name: '박여행',
        profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80'
      },
      likes: 56,
      comments: 4
    }
  ];

  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <Flex justifyContent="space-between" alignItems="center" mb={6} width="100%">
          <Heading as="h1" size="xl">My Memories</Heading>
          <Button 
            colorScheme="blue" 
            onClick={handleCreateMemory}
            leftIcon={<AddIcon />}
          >
            Create Memory
          </Button>
        </Flex>

        <VStack spacing={8} align="stretch">
          {memories.map(memory => (
            <MemoryCard 
              key={memory.id}
              images={memory.images}
              description={memory.description}
              author={memory.author}
              likes={memory.likes}
              comments={memory.comments}
            />
          ))}
        </VStack>
      </Box>
    </Container>
  );
};

export default MyMemoriesPage;
