import React, { useRef, useEffect } from 'react';
import { Box, VStack, Spinner, Center } from '@chakra-ui/react';
import ResponsiveMemoryCard from './ResponsiveMemoryCard';
import useAuth from '../hooks/useAuth';
import useMemories from '../hooks/useMemories';
import { ResponsiveContainer, HeroSection } from './design-system';

interface MemoriesPageProps {
  title: string;
  memoryType: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP';
  requireAuth?: boolean;
}

const MemoriesPage: React.FC<MemoriesPageProps> = ({ title, memoryType, requireAuth = true }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Redirect to login if not authenticated and requireAuth is true
  const { isAuthenticated } = useAuth(requireAuth);

  // Only fetch memories if authentication is not required or user is authenticated
  const { memories, loading, hasMore, memoriesRef, fetchMemories, isInitialLoad } = useMemories({
    memoryType,
    skipFetch: requireAuth && !isAuthenticated
  });

  const fetchMemoriesRef = useRef(fetchMemories);

  // fetchMemories ref 업데이트
  useEffect(() => {
    fetchMemoriesRef.current = fetchMemories;
  }, [fetchMemories]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    // 초기 로드 중이거나 로딩 중이면 observer 설정하지 않음
    if (isInitialLoad || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const currentMemories = memoriesRef.current;
          const lastMemoryId = currentMemories.length > 0 ? currentMemories[currentMemories.length - 1].id : undefined;
          fetchMemoriesRef.current(lastMemoryId);
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
  }, [isInitialLoad, hasMore, loading]);

  return (
    <ResponsiveContainer maxWidth="lg" centerContent padding>
      <Box width="100%" py={8}>
        <HeroSection
          title={title}
          variant="minimal"
          textAlign="center"
          mb={8}
        />

        <VStack 
          spacing={{ base: 6, md: 8 }} 
          align="stretch"
          width="100%"
          maxWidth="600px"
          mx="auto"
        >
          {memories.map(memory => (
            <ResponsiveMemoryCard 
              key={memory.id}
              memoryId={memory.id}
              images={memory.files.map(file => file.fileUrl)}
              description={memory.content}
              author={{
                id: memory.member.id,
                name: memory.member.nickname || memory.member.name,
                profileImage: memory.member.profile?.fileUrl || ''
              }}
              comments={memory.commentsCount || 0} // API에서 댓글 수 직접 제공
              memorableDate={memory.memorableDate}
              hashTags={memory.hashTagNames || []}
            />
          ))}
        </VStack>

        {/* Loading indicator */}
        <Center 
          ref={loadingRef} 
          py={8}
          minHeight="60px"
        >
          {loading && (
            <Spinner 
              size="lg" 
              color="brand.500"
              thickness="3px"
            />  
          )}
        </Center>
      </Box>
    </ResponsiveContainer>
  );
};

export default MemoriesPage;
