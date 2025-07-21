import React, { useRef, useEffect } from 'react';
import { Container, Box, Heading, VStack, Button, Flex, Spinner, Center } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import MemoryCard from './MemoryCard';
import useAuth from '../hooks/useAuth';
import usePublicMemories from '../hooks/usePublicMemories';

interface PublicMemoriesPageProps {
  title: string;
  requireAuth?: boolean;
}

const PublicMemoriesPage: React.FC<PublicMemoriesPageProps> = ({ title, requireAuth = false }) => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Redirect to login if not authenticated and requireAuth is true
  const { isAuthenticated } = useAuth(requireAuth);

  // Only fetch memories if authentication is not required or user is authenticated
  const { memories, loading, hasMore, memoriesRef, fetchMemories } = usePublicMemories({ 
    skipFetch: requireAuth && !isAuthenticated
  });

  const handleCreateMemory = () => {
    navigate('/create-memory');
  };

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const currentMemories = memoriesRef.current;
          const lastMemoryId = currentMemories.length > 0 ? currentMemories[currentMemories.length - 1].id : undefined;
          fetchMemories(lastMemoryId);
        }
      },
      { threshold: 0.9 } // Trigger when 90% of the element is visible
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current && loadingRef.current) {
        observerRef.current.unobserve(loadingRef.current);
      }
    };
  }, [fetchMemories, hasMore, loading, memoriesRef]);

  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <Flex justifyContent="space-between" alignItems="center" mb={6} width="100%">
          <Heading as="h1" size="xl">{title}</Heading>
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
              memoryId={memory.id}
              images={memory.files.map(file => file.fileUrl)}
              description={memory.content}
              author={{
                id: memory.member.id,
                name: memory.member.nickname || memory.member.name,
                profileImage: memory.member.profile?.fileUrl || ''
              }}
              comments={memory.commentsCount || 0} // API에서 댓글 수 사용
              enableCommentsCount={!memory.commentsCount} // API에 commentsCount가 없으면 실시간 조회
              source="sharing" // sharing memories에서 온 경우
            />
          ))}
        </VStack>

        {/* Loading indicator */}
        <Center ref={loadingRef} py={4}>
          {loading && <Spinner size="md" />}
        </Center>
      </Box>
    </Container>
  );
};

export default PublicMemoriesPage;
