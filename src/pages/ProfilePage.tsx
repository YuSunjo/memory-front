import React from 'react';
import { Container, Box } from '@chakra-ui/react';
import UserProfile from '../components/UserProfile';

const ProfilePage: React.FC = () => {
  return (
    <Container maxW="container.lg" centerContent flex="1" py={8}>
      <Box width="100%" maxW="600px">
        <UserProfile />
      </Box>
    </Container>
  );
};

export default ProfilePage;