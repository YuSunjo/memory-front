import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  FormErrorMessage,
  useToast,
  Container
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, isLoading, error } = useMemberStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the login function from memberStore
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: 'Login successful.',
          description: "You've been logged in successfully.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to home page
        navigate('/');
      } else {
        toast({
          title: 'Login failed.',
          description: error || 'Unable to log in. Please check your credentials.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to log in. Please check your credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box 
        bg="rgba(255, 255, 255, 0.95)" 
        backdropFilter="blur(20px)"
        p={10} 
        borderRadius="3xl" 
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
        border="1px solid rgba(255, 255, 255, 0.2)"
      >
        <VStack spacing={6} align="stretch">
          <Heading 
            as="h1" 
            size="xl" 
            textAlign="center"
            bgGradient="linear(45deg, #667eea, #764ba2)"
            bgClip="text"
            fontWeight="bold"
          >
            다시 만나서 반가워요! 👋
          </Heading>
          <Text textAlign="center" color="gray.600" fontSize="lg">
            당신의 추억들이 기다리고 있어요
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel color="gray.700" fontWeight="medium">이메일</FormLabel>
                <Input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="이메일을 입력해주세요"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{ 
                    borderColor: "purple.500", 
                    boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.3)" 
                  }}
                  transition="all 0.3s ease"
                  py={6}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel color="gray.700" fontWeight="medium">비밀번호</FormLabel>
                <Input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="비밀번호를 입력해주세요"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: "purple.300" }}
                  _focus={{ 
                    borderColor: "purple.500", 
                    boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.3)" 
                  }}
                  transition="all 0.3s ease"
                  py={6}
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button 
                type="submit" 
                bg="linear-gradient(45deg, #667eea, #764ba2)"
                color="white"
                width="full" 
                mt={6} 
                py={7}
                borderRadius="xl"
                fontSize="lg"
                fontWeight="bold"
                isLoading={isSubmitting || isLoading}
                loadingText="Logging in"
                _hover={{
                  bg: "linear-gradient(45deg, #5a6fd8, #6a4190)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)"
                }}
                _active={{
                  transform: "translateY(0px)"
                }}
                transition="all 0.3s ease"
              >
                추억 속으로 떠나기 🌟
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;
