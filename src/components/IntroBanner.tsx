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
          display="flex"
          alignItems="center"
          gap={3}
        >
          ✨ 당신의 이야기가 시작되는 곳 • 💫 특별한 순간들을 영원히 간직하세요 • 🎨 아름다운 추억이 살아 숨쉬는 공간 • 💝 소중한 사람들과 함께하는 기억의 여행 ✨
        </Text>
      </Box>
    </Box>
  );
};

export default IntroBanner;