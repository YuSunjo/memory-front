import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Image,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';
import useAuth from '../hooks/useAuth';
import { api } from '../hooks/useApi';

const ProfileEditPage: React.FC = () => {
  const { updateMemberProfile } = useMemberStore();
  const { member, isLoading, error } = useAuth(true);
  const navigate = useNavigate();
  const toast = useToast();

  const [nickname, setNickname] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [fileId, setFileId] = useState<number | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (member) {
      setNickname(member.nickname || '');
      setProfileImageUrl(member.profile?.fileUrl || '');
      setPreviewUrl(member.profile?.fileUrl || '');
    }
  }, [member]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload the image immediately
      setIsUploading(true);
      setUploadError('');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(
          '/v1/file?fileType=MEMBER',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.status === 200 || response.status === 201) {
          const fileData = response.data.data;
          const newFileId = fileData.id;
          const fileUrl = fileData.fileUrl;
          setFileId(newFileId);
          setProfileImageUrl(fileUrl);
          toast({
            title: 'Image Uploaded',
            description: 'Your image has been successfully uploaded.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError('Failed to upload image');
        toast({
          title: 'Image Upload Failed',
          description: 'Failed to upload image. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsUploading(false);
      }

      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError('');

    try {
      // Check if we're currently uploading an image
      if (isUploading) {
        toast({
          title: 'Image Upload in Progress',
          description: 'Please wait for the image to finish uploading.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Check if there was an error uploading the image
      if (uploadError) {
        toast({
          title: 'Image Upload Failed',
          description: uploadError,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Update profile with new nickname and file ID
      const success = await updateMemberProfile(nickname, fileId);

      if (success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/profile');
      } else {
        toast({
          title: 'Update Failed',
          description: error || 'Failed to update profile. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Box bg="white" p={8} rounded="md" shadow="md">
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center">Edit Profile</Heading>
          <Text textAlign="center" color="gray.600">Update your profile information</Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel>Profile Image</FormLabel>
                <Flex direction="column" align="center">
                  {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt="Profile Preview"
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="full"
                      mb={4}
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    p={1}
                    isDisabled={isUploading}
                  />
                  {isUploading && (
                    <Flex align="center" mt={2}>
                      <Spinner size="sm" mr={2} />
                      <Text>Uploading image...</Text>
                    </Flex>
                  )}
                </Flex>
                {uploadError && (
                  <Text color="red.500" mt={2}>{uploadError}</Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nickname</FormLabel>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                />
              </FormControl>

              <Flex justify="space-between" width="100%" mt={4}>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  loadingText="Saving"
                >
                  Save Changes
                </Button>
              </Flex>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default ProfileEditPage;
