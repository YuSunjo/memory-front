import React from 'react';
import { 
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue
} from '@chakra-ui/react';
import MemoriesPage from '../components/MemoriesPage';
import { ResponsiveContainer, Title } from '../components/design-system';
import { designTokens } from '../theme/tokens';
import useAuth from '../hooks/useAuth';

const MyMemoriesPage: React.FC = () => {
  // 인증 확인 - 로그인이 필요한 페이지
  useAuth(true, '/login');
  
  // Responsive configurations
  const tabSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const containerPadding = useBreakpointValue({ 
    base: designTokens.spacing.sm, 
    md: designTokens.spacing.md 
  });

  return (
    <ResponsiveContainer maxWidth="xl" padding centerContent>
      <Box width="100%" py={4} px={containerPadding}>
        <Title 
          gradient 
          textAlign="center"
          mb={6}
          fontSize={{ base: '2xl', md: '3xl' }}
        >
          💝 내 추억 갤러리
        </Title>
        
        <Tabs
          variant="enclosed"
          colorScheme="brand"
          size={tabSize}
          defaultIndex={0}
        >
          <TabList
            bg={designTokens.colors.glass.background}
            borderRadius="xl"
            border="1px solid"
            borderColor={designTokens.colors.glass.border}
            p={1}
            mb={6}
          >
            <Tab
              flex="1"
              _selected={{
                bg: designTokens.colors.brand.gradient,
                color: 'white',
                borderColor: 'transparent',
              }}
              borderRadius="lg"
              fontWeight="semibold"
              fontSize={{ base: 'sm', md: 'md' }}
            >
              💝 개인 추억
            </Tab>
            <Tab
              flex="1"
              _selected={{
                bg: designTokens.colors.brand.gradient,
                color: 'white',
                borderColor: 'transparent',
              }}
              borderRadius="lg"
              fontWeight="semibold"
              fontSize={{ base: 'sm', md: 'md' }}
            >
              👥 함께한 순간
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <MemoriesPage 
                title="" 
                memoryType="PRIVATE" 
                requireAuth={false} // 이미 상위에서 인증 체크
              />
            </TabPanel>
            <TabPanel p={0}>
              <MemoriesPage 
                title="" 
                memoryType="RELATIONSHIP" 
                requireAuth={false} // 이미 상위에서 인증 체크
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ResponsiveContainer>
  );
};

export default MyMemoriesPage;
