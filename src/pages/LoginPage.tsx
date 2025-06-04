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
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
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
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/member/login`;
      
      const response = await axios.post(apiUrl, {
        email: formData.email,
        password: formData.password
      });
      
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Login successful.',
          description: "You've been logged in successfully.",
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to home page
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to log in. Please check your credentials.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxW="container.md" py={8}>
      <Box bg="white" p={8} rounded="md" shadow="md">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">Login</Heading>
          <Text textAlign="center" color="gray.600">Sign in to your account</Text>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Enter your password"
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                width="full" 
                mt={4} 
                isLoading={isSubmitting}
                loadingText="Logging in"
              >
                Login
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default LoginPage;