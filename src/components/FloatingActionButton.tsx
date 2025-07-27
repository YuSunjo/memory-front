import React from 'react';
import { IconButton, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
  isVisible?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isVisible = true }) => {
  const navigate = useNavigate();
  const size = useBreakpointValue({ base: 'md', md: 'lg' });
  // Adjust bottom position to account for mobile navigation (80px height + 20px padding)
  const bottomPosition = useBreakpointValue({ base: '100px', md: '30px' });
  const rightPosition = useBreakpointValue({ base: '20px', md: '30px' });
  // Show on all devices - mobile and desktop (web version style)
  const showOnCurrentBreakpoint = useBreakpointValue({ base: true, lg: true });

  const handleCreateMemory = () => {
    navigate('/create-memory');
  };

  if (!isVisible || !showOnCurrentBreakpoint) return null;

  return (
    <Tooltip 
      label="새로운 추억 만들기" 
      placement="left" 
      hasArrow
      bg="gray.700"
      color="white"
      borderRadius="md"
      fontSize="sm"
    >
      <IconButton
        aria-label="새로운 추억 만들기"
        icon={<AddIcon />}
        size={size}
        onClick={handleCreateMemory}
        position="fixed"
        bottom={bottomPosition}
        right={rightPosition}
        zIndex={1200}
        bg="linear-gradient(45deg, #667eea, #764ba2)"
        color="white"
        borderRadius="full"
        boxShadow={{ base: "0 6px 24px rgba(102, 126, 234, 0.5)", md: "0 8px 32px rgba(102, 126, 234, 0.4)" }}
        _hover={{
          bg: "linear-gradient(45deg, #5a6fd8, #6a4190)",
          transform: "scale(1.1)",
          boxShadow: { base: "0 8px 32px rgba(102, 126, 234, 0.7)", md: "0 12px 40px rgba(102, 126, 234, 0.6)" }
        }}
        _active={{
          transform: "scale(0.95)"
        }}
        transition="all 0.3s ease"
        width={{ base: "56px", md: "60px" }}
        height={{ base: "56px", md: "60px" }}
        fontSize={{ base: "lg", md: "xl" }}
        // 펄스 애니메이션을 위한 가상 요소
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: 'full',
          bg: 'linear-gradient(45deg, #667eea, #764ba2)',
          opacity: 0.4,
          animation: 'pulse 2s infinite'
        }}
        sx={{
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.4
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 0.1
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 0.4
            }
          }
        }}
      />
    </Tooltip>
  );
};

export default FloatingActionButton;