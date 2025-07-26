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
import { api } from '../hooks/useApi';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      nickname: ''
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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Nickname validation
    if (!formData.nickname) {
      newErrors.nickname = 'Nickname is required';
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
      const response = await api.post('/v1/member/signup', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nickname: formData.nickname
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Account created.',
          description: "We've created your account for you.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to login page after successful signup
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to create your account.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Signup error:', error);
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
            새로운 시작을 환영해요! 🌟
          </Heading>
          <Text textAlign="center" color="gray.600" fontSize="lg">
            당신만의 특별한 추억 공간을 만들어보세요
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

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel color="gray.700" fontWeight="medium">비밀번호 확인</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
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
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="gray.700" fontWeight="medium">이름</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="실명을 입력해주세요"
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
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.nickname}>
                <FormLabel color="gray.700" fontWeight="medium">닉네임</FormLabel>
                <Input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="다른 사람들에게 보여질 이름을 입력해주세요"
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
                <FormErrorMessage>{errors.nickname}</FormErrorMessage>
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
                isLoading={isSubmitting}
                loadingText="계정 생성 중..."
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
                추억 여행 시작하기 🚀
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default SignupPage;
