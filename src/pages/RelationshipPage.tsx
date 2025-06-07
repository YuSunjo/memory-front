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

interface ReceivedRelationshipResponse {
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
  const [receivedRequests, setReceivedRequests] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [searchedMember, setSearchedMember] = useState<MemberResponse['data'] | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        setLoading(true);
        // First, check for existing relationships
        const response = await api.get<RelationshipResponse>('/v1/relationship');
        const relationships = response.data.data.relationships;
        setRelationships(relationships);

        if (relationships.length === 0) {
          try {
            const receivedResponse = await api.get<ReceivedRelationshipResponse>('/v1/relationship/received');
            setReceivedRequests(receivedResponse.data.data.relationships);
          } catch (receivedErr) {
            console.error('Error fetching received relationship requests:', receivedErr);
          }
        }

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
    setRequestSuccess(false);
    setRequestError(null);

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

  const handleCoupleRequest = async () => {
    if (!searchedMember) return;

    setRequestSuccess(false);
    setRequestError(null);

    try {
      setRequestLoading(true);
      await api.post('/v1/relationship/request', {
        relatedMemberId: searchedMember.id
      });
      setRequestSuccess(true);
    } catch (err) {
      console.error('Error sending relationship request:', err);
      setRequestError('관계 요청을 보내는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setRequestLoading(false);
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
        ) : relationships.length > 0 ? (
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
        ) : receivedRequests.length > 0 ? (
          <VStack spacing={4} align="stretch">
            <Text fontSize="xl" fontWeight="medium" mb={2}>받은 관계 요청</Text>
            {receivedRequests.map((request) => (
              <Box key={request.id} p={4} borderWidth="1px" borderRadius="md">
                <Text>ID: {request.id}</Text>
                <Text>Status: {request.relationshipStatus}</Text>
                <Text>Start Date: {new Date(request.startDate).toLocaleDateString()}</Text>
                {request.endDate && (
                  <Text>End Date: {new Date(request.endDate).toLocaleDateString()}</Text>
                )}
              </Box>
            ))}
          </VStack>
        ) : (
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
                <HStack spacing={4} justify="space-between">
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
                  <Button 
                    colorScheme="pink" 
                    onClick={handleCoupleRequest}
                    isLoading={requestLoading}
                    loadingText="요청 중"
                    isDisabled={requestSuccess}
                  >
                    커플
                  </Button>
                </HStack>

                {requestSuccess && (
                  <Alert status="success" mt={2} borderRadius="md">
                    <AlertIcon />
                    커플 요청이 성공적으로 전송되었습니다.
                  </Alert>
                )}

                {requestError && (
                  <Alert status="error" mt={2} borderRadius="md">
                    <AlertIcon />
                    {requestError}
                  </Alert>
                )}
              </Box>
            )}
          </VStack>
        )}
      </Box>
    </Container>
  );
};

export default RelationshipPage;
