import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Box, Heading, VStack, Button, Flex, Spinner, Center } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';
import useApi from '../hooks/useApi';
import useAuth from '../hooks/useAuth';
import type { MemoryResponse } from '../types';

const MemoriesWithRelationshipPage: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const memoriesRef = useRef<MemoryResponse[]>([]);

  // Redirect to login if not authenticated
  useAuth(true);

  const handleCreateMemory = () => {
    navigate('/create-memory');
  };

  const fetchMemories = useCallback(async (lastMemoryId?: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let url = '/v1/memories/member?memoryType=RELATIONSHIP&size=5';
      if (lastMemoryId) {
        url += `&lastMemoryId=${lastMemoryId}`;
      }

      const response = await api.get<MemoryResponse[]>(url);
      const newMemories = response.data.data;

      setMemories(prev => {
        const updatedMemories = [...prev, ...newMemories];
        memoriesRef.current = updatedMemories;
        return updatedMemories;
      });

      if (newMemories.length < 5) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Initial load
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

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
  }, [fetchMemories, hasMore, loading]);

  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <Flex justifyContent="space-between" alignItems="center" mb={6} width="100%">
          <Heading as="h1" size="xl">Memories</Heading>
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
              images={memory.files.map(file => file.fileUrl)}
              description={memory.content}
              author={{
                id: memory.member.id,
                name: memory.member.nickname || memory.member.name,
                profileImage: memory.member.profile?.fileUrl || ''
              }}
              likes={0} // API doesn't provide likes count yet
              comments={0} // API doesn't provide comments count yet
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

export default MemoriesWithRelationshipPage;