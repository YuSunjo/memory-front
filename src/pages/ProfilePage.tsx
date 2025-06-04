import React from 'react';
import { Container, Box } from '@chakra-ui/react';
import MemberProfile from '../components/MemberProfile';

const ProfilePage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <MemberProfile />
      </Box>
    </Container>
  );
};

export default ProfilePage;
