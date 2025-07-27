import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
  useToast,
  useBreakpointValue
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';
import { 
  GradientButton, 
  ResponsiveContainer,
  Card,
  Title,
  Body
} from '../components/design-system';
import { designTokens } from '../theme/tokens';

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

  // Responsive configurations
  const formPadding = useBreakpointValue({ 
    base: designTokens.spacing.md, 
    md: designTokens.spacing.lg, 
    lg: designTokens.spacing.xl 
  });

  const containerMaxWidth = useBreakpointValue({ 
    base: '100%', 
    md: '500px', 
    lg: '600px' 
  });

  return (
    <ResponsiveContainer maxWidth="md" centerContent padding>
      <Box py={8} width="100%" maxWidth={containerMaxWidth}>
        <Card 
          p={formPadding}
          borderRadius="3xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <VStack spacing={6} align="stretch">
            <VStack spacing={4} textAlign="center">
              <Title 
                gradient
                responsive
                fontSize={{ base: '2xl', md: '3xl' }}
              >
                추억 속으로, 다시 돌아오셨네요 🌟
              </Title>
              <Body 
                color="gray.600"
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="md"
              >
                당신의 소중한 추억들이 기다리고 있어요
              </Body>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel 
                    color="gray.700" 
                    fontWeight="medium"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    이메일
                  </FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="이메일을 입력해주세요"
                    variant="glass"
                    size={{ base: 'md', md: 'lg' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                  />
                  <FormErrorMessage fontSize="sm">{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel 
                    color="gray.700" 
                    fontWeight="medium"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    비밀번호
                  </FormLabel>
                  <Input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="비밀번호를 입력해주세요"
                    variant="glass"
                    size={{ base: 'md', md: 'lg' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                  />
                  <FormErrorMessage fontSize="sm">{errors.password}</FormErrorMessage>
                </FormControl>

                <Box width="full" pt={4}>
                  <GradientButton 
                    type="submit" 
                    variant="primary"
                    size={useBreakpointValue({ base: 'md', md: 'lg' })}
                    width="full"
                    isLoading={isSubmitting || isLoading}
                    loadingText="로그인 중..."
                    glowOnHover
                  >
                    추억 속으로 떠나기 🌟
                  </GradientButton>
                </Box>
              </VStack>
            </form>
          </VStack>
        </Card>
      </Box>
    </ResponsiveContainer>
  );
};

export default LoginPage;
