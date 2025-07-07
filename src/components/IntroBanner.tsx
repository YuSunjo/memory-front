import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const IntroBanner: React.FC = () => {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/about');
  };

  return (
    <Box
      bg="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
      color="white"
      py={2}
      overflow="hidden"
      cursor="pointer"
      onClick={handleBannerClick}
      position="relative"
      _hover={{
        bg: "linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)",
      }}
      transition="all 0.3s ease"
    >
      <Box
        position="relative"
        height="100%"
        display="flex"
        alignItems="center"
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          whiteSpace="nowrap"
          className="banner-scroll"
        >
          🌟 Memory - 소중한 추억을 아름답게 기록하고 영원히 간직하는 디지털 추억 저장소 ✨
        </Text>
      </Box>
    </Box>
  );
};

export default IntroBanner;