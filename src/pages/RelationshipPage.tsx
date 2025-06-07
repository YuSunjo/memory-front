import React, { useEffect, useState } from 'react';
import { Container, Box, Text, VStack, Spinner, Center, Input, Button, HStack, Alert, AlertIcon, Avatar } from '@chakra-ui/react';
import useApi from '../hooks/useApi';

interface Relationship {
  id: number;
  memberId: number;
  relatedMemberId: number;
  relationshipStatus: string;
  startDate: string;
  endDate: string;
}

interface RelationshipResponse {
  statusCode: number;
  message: string;
  data: {
    relationships: Relationship[];
  };
}

interface MemberResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    profileImageUrl: string;
  };
}

const RelationshipPage: React.FC = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [searchedMember, setSearchedMember] = useState<MemberResponse['data'] | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        setLoading(true);
        const response = await api.get<RelationshipResponse>('/v1/relationship');
        setRelationships(response.data.data.relationships);
        setError(null);
      } catch (err) {
        console.error('Error fetching relationships:', err);
        setError('Failed to load relationships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, []);

  const handleSearch = async () => {
    // Reset previous search results and errors
    setSearchedMember(null);
    setSearchError(null);

    // Validate email is not empty
    if (!email.trim()) {
      setSearchError('이메일을 입력해주세요.');
      return;
    }

    try {
      setSearching(true);
      const response = await api.get<MemberResponse>(`/v1/member/email?email=${encodeURIComponent(email)}`);
      setSearchedMember(response.data.data);
    } catch (err) {
      console.error('Error searching for member:', err);
      setSearchError('회원을 찾을 수 없습니다. 이메일을 확인해주세요.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        {loading ? (
          <Center py={10}>
            <Spinner size="xl" />
          </Center>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : relationships.length === 0 ? (
          <VStack spacing={4} py={10} width="100%">
            <Text fontSize="xl" fontWeight="medium">짝을 찾아보세요</Text>
            <HStack width="100%" spacing={2}>
              <Input 
                placeholder="이메일을 입력하세요" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                colorScheme="blue" 
                onClick={handleSearch} 
                isLoading={searching}
                loadingText="검색 중"
              >
                찾기
              </Button>
            </HStack>

            {searchError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {searchError}
              </Alert>
            )}

            {searchedMember && (
              <Box p={4} borderWidth="1px" borderRadius="md" width="100%" mt={4}>
                <HStack spacing={4}>
                  <Avatar 
                    name={searchedMember.name || searchedMember.nickname} 
                    src={searchedMember.profileImageUrl}
                    size="md"
                  />
                  <Box>
                    <Text fontWeight="bold">{searchedMember.name || searchedMember.nickname}</Text>
                    <Text fontSize="sm" color="gray.500">{searchedMember.email}</Text>
                  </Box>
                </HStack>
              </Box>
            )}
          </VStack>
        ) : (
          <VStack spacing={4} align="stretch">
            {relationships.map((relationship) => (
              <Box key={relationship.id} p={4} borderWidth="1px" borderRadius="md">
                <Text>ID: {relationship.id}</Text>
                <Text>Status: {relationship.relationshipStatus}</Text>
                <Text>Start Date: {new Date(relationship.startDate).toLocaleDateString()}</Text>
                {relationship.endDate && (
                  <Text>End Date: {new Date(relationship.endDate).toLocaleDateString()}</Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Container>
  );
};

export default RelationshipPage;
