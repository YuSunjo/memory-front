import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  Badge
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useMemberLinkService } from '../services/memberLinkService';
import type { MemberLink, MemberInfo } from '../types/memberLink';

const LinkPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchPublicMemberLinks } = useMemberLinkService();

  useEffect(() => {
    if (memberId) {
      loadPublicLinks();
    }
  }, [memberId]);

  const loadPublicLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 공개된 링크와 멤버 정보 가져오기
      const { links, member } = await fetchPublicMemberLinks(parseInt(memberId!));
      setLinks(links);
      setMemberInfo(member);
      
      console.log('🔗 Loaded public links:', links);
      console.log('👤 Loaded member info:', member);
    } catch (err) {
      setError('링크를 불러오는데 실패했습니다.');
      console.error('Error loading public links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: MemberLink) => {
    try {
      // 클릭 수 증가 (API 호출 필요)
      // await incrementLinkClick(link.id);
      
      // 외부 링크 열기
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error tracking link click:', err);
      // 에러가 있어도 링크는 열어줌
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getIconDisplay = (iconUrl: string) => {
    if (iconUrl && iconUrl.length <= 2) {
      // 이모지인 경우
      return iconUrl;
    } else if (iconUrl && iconUrl.startsWith('http')) {
      // URL인 경우 (나중에 이미지로 처리)
      return '🔗';
    } else {
      return '🔗';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>링크를 불러오는 중...</Text>
      </Container>
    );
  }

  if (error || !memberInfo) {
    return (
      <Container maxW="container.md" centerContent py={10}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Text>{error || '멤버 정보를 찾을 수 없습니다.'}</Text>
        </Alert>
      </Container>
    );
  }

  const activeLinks = links.filter(link => link.isActive && link.isVisible);

  return (
    <Container maxW="container.md" centerContent py={10}>
      <VStack spacing={8} w="100%" maxW="500px">
        {/* 프로필 영역 */}
        <VStack spacing={4} textAlign="center">
          <Avatar 
            size="xl" 
            name={memberInfo?.name || memberInfo?.nickname} 
            src={memberInfo?.profile?.fileUrl}
            bg="blue.500" 
            color="white"
          />
          <Box>
            <Heading size="lg" mb={1}>
              {memberInfo?.name || memberInfo?.nickname}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              @{memberInfo?.nickname}
            </Text>
          </Box>
          
          {activeLinks.length > 0 && (
            <Badge colorScheme="blue" fontSize="xs">
              {activeLinks.length}개의 링크
            </Badge>
          )}
        </VStack>

        {/* 링크 목록 */}
        <VStack spacing={4} w="100%">
          {activeLinks.length === 0 ? (
            <Center py={10}>
              <VStack spacing={3}>
                <Text fontSize="lg">🔗</Text>
                <Text color="gray.500" textAlign="center">
                  아직 공개된 링크가 없습니다
                </Text>
              </VStack>
            </Center>
          ) : (
            activeLinks.map((link) => (
              <Button
                key={link.id}
                w="100%"
                h="auto"
                p={6}
                bg="white"
                border="2px"
                borderColor="gray.200"
                borderRadius="xl"
                shadow="sm"
                _hover={{ 
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                  borderColor: 'blue.300',
                  bg: 'blue.50'
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
                onClick={() => handleLinkClick(link)}
                variant="unstyled"
                display="flex"
                flexDirection="column"
                alignItems="stretch"
              >
                <HStack spacing={4} w="100%">
                  <Text fontSize="2xl" flexShrink={0}>
                    {getIconDisplay(link.iconUrl)}
                  </Text>
                  <VStack spacing={1} flex={1} align="start">
                    <Text 
                      fontWeight="semibold" 
                      fontSize="md"
                      color="gray.800"
                      textAlign="left"
                      w="100%"
                    >
                      {link.title}
                    </Text>
                    {link.description && (
                      <Text 
                        fontSize="sm" 
                        color="gray.600" 
                        textAlign="left"
                        w="100%"
                        noOfLines={2}
                      >
                        {link.description}
                      </Text>
                    )}
                    <Text 
                      fontSize="xs" 
                      color="blue.500"
                      textAlign="left"
                      w="100%"
                    >
                      {getHostname(link.url)}
                    </Text>
                  </VStack>
                  <ExternalLinkIcon 
                    color="gray.400" 
                    flexShrink={0}
                    boxSize={4}
                  />
                </HStack>
              </Button>
            ))
          )}
        </VStack>

        {/* 푸터 */}
        <Text 
          fontSize="xs" 
          color="gray.400" 
          textAlign="center"
          mt={8}
        >
          Powered by Memory
        </Text>
      </VStack>
    </Container>
  );
};

export default LinkPage;