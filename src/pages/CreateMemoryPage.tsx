import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Heading, 
  VStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  Button, 
  Spinner, 
  Alert, 
  AlertIcon,
  useToast,
  Flex,
  Text,
  RadioGroup,
  Radio,
  HStack,
  Image,
  Grid,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import GoogleMap from '../components/GoogleMap';
import useApi from '../hooks/useApi';
import useAuth from '../hooks/useAuth';
import useHashtagService from '../hooks/useHashtagService';
import useMemberStore from '../store/memberStore';
import type {LocationData, MapData, MapFormData, MemoryFormData, FileResponse} from "../types";

const CreateMemoryPage: React.FC = () => {
  // 인증 확인 - 로그인이 필요한 페이지
  useAuth(true, '/login');
  
  const navigate = useNavigate();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [formData, setFormData] = useState<MemoryFormData>({
    title: '',
    content: '',
    locationName: '',
    mapId: null,
    memoryType: 'PUBLIC',
    memorableDate: new Date().toISOString().split('T')[0], // Default to today
    fileIdList: [],
    hashTagList: []
  });
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileResponse[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hashTagInput, setHashTagInput] = useState<string>('');
  const [hashTagSuggestions, setHashTagSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const api = useApi();
  const { searchHashtags } = useHashtagService();
  const { isAuthenticated } = useMemberStore();
  const toast = useToast();

  // Fetch maps from the API
  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<MapData[]>('/v1/maps/member');
      setMaps(response.data.data || []);
    } catch (err) {
      console.error('Error fetching maps:', err);
      setError('Failed to load maps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaps();
    }
  }, [isAuthenticated]);

  // Search hashtags when input changes
  useEffect(() => {
    const searchHashtagsDebounced = async () => {
      if (hashTagInput.trim()) {
        const suggestions = await searchHashtags(hashTagInput.trim());
        setHashTagSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setHashTagSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchHashtagsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [hashTagInput]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle memory type change
  const handleMemoryTypeChange = (value: 'PUBLIC' | 'PRIVATE' | 'RELATIONSHIP') => {
    setFormData(prev => ({
      ...prev,
      memoryType: value
    }));
  };

  // Handle map marker click
  const handleMapClick = (map: MapData) => {
    setSelectedMap(map);
    setSelectedLocation(null); // Clear selected location when a map is selected
    setFormData(prev => ({
      ...prev,
      mapId: map.id,
      locationName: map.name
    }));
  };

  // Handle location select (when clicking on the map)
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setSelectedMap(null); // Clear selected map when a location is selected
    setFormData(prev => ({
      ...prev,
      mapId: null,
      locationName: location.address
    }));
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post<FileResponse[], unknown>('/v1/files?fileType=MEMORY', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedFiles: FileResponse[] = response.data.data;
      setUploadedFiles(uploadedFiles);

      // Extract file IDs and update form data
      const fileIds = uploadedFiles.map(file => file.id);
      setFormData(prev => ({
        ...prev,
        fileIdList: fileIds
      }));

      toast({
        title: 'Files uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clear selected files after successful upload
      setSelectedFiles([]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setUploadError('Failed to upload files. Please try again.');
      toast({
        title: 'Failed to upload files',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.locationName.trim()) {
      toast({
        title: 'Location name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if we have either a selected map or a selected location
    if (!formData.mapId && !selectedLocation) {
      toast({
        title: 'Please select a location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if files are selected but not uploaded
    if (selectedFiles.length > 0 && uploadedFiles.length === 0) {
      toast({
        title: 'Please upload your selected files first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      let mapId = formData.mapId;

      // If no map is selected but a location is selected, create a new map first
      if (!mapId && selectedLocation) {
        // Prepare map data
        const mapData: MapFormData = {
          name: formData.locationName,
          description: formData.locationName,
          address: selectedLocation.address,
          latitude: selectedLocation.latitude.toString(),
          longitude: selectedLocation.longitude.toString(),
          mapType: "USER_PLACE"
        };

        try {
          // Create a new map
          const mapResponse = await api.post<MapData, MapFormData>('/v1/maps', mapData)
          mapId = mapResponse.data.data.id;
        } catch (mapErr) {
          console.error('Error creating map:', mapErr);
          toast({
            title: 'Failed to create map',
            description: 'Please try again later',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          throw mapErr;
        }
      }

      // Send the form data to the API with the map ID and file IDs
      await api.post('/v1/memories', {
        ...formData,
        mapId,
        fileIdList: formData.fileIdList,
        hashTagList: formData.hashTagList
      });

      toast({
        title: 'Memory created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (formData.memoryType === 'PUBLIC') {
        navigate('/sharing-memories');
      } else if (formData.memoryType === 'PRIVATE') {
        navigate('/my-memories');
      } else if (formData.memoryType === 'RELATIONSHIP') {
        navigate('/memories-with-relationship');
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        locationName: '',
        mapId: null,
        memoryType: 'PUBLIC',
        memorableDate: new Date().toISOString().split('T')[0],
        fileIdList: [],
        hashTagList: []
      });
      setHashTagInput('');
      setSelectedMap(null);
      setSelectedLocation(null);
      setUploadedFiles([]);

    } catch (err) {
      console.error('Error creating memory:', err);
      toast({
        title: 'Failed to create memory',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" p={4} flex="1">
      <Heading as="h1" size="xl" mb={6}>Create Memory</Heading>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* Form section */}
        <Box width={{ base: '100%', md: '40%' }}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Enter memory title"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Content</FormLabel>
                <Textarea 
                  name="content" 
                  value={formData.content} 
                  onChange={handleInputChange} 
                  placeholder="Describe your memory"
                  minHeight="150px"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Memorable Date</FormLabel>
                <Input 
                  name="memorableDate" 
                  type="date"
                  value={formData.memorableDate} 
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Location Name</FormLabel>
                <Input 
                  name="locationName" 
                  value={formData.locationName} 
                  onChange={handleInputChange} 
                  placeholder="Enter location name"
                  readOnly={!!selectedMap}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Memory Type</FormLabel>
                <RadioGroup 
                  value={formData.memoryType} 
                  onChange={handleMemoryTypeChange}
                >
                  <HStack spacing={4}>
                    <Radio value="PUBLIC">Public</Radio>
                    <Radio value="PRIVATE">Private</Radio>
                    <Radio value="RELATIONSHIP">Relationship</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Hash Tags</FormLabel>
                <Flex direction="column" gap={2}>
                  <Box position="relative">
                    <Flex gap={2}>
                      <Input 
                        value={hashTagInput}
                        onChange={(e) => setHashTagInput(e.target.value)}
                        placeholder="Enter hashtag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const tag = hashTagInput.trim();
                            if (tag && !formData.hashTagList?.includes(tag)) {
                              setFormData(prev => ({
                                ...prev,
                                hashTagList: [...(prev.hashTagList || []), tag]
                              }));
                              setHashTagInput('');
                              setShowSuggestions(false);
                            }
                          }
                        }}
                        onFocus={() => {
                          if (hashTagSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 150);
                        }}
                      />
                      <Button
                        onClick={() => {
                          const tag = hashTagInput.trim();
                          if (tag && !formData.hashTagList?.includes(tag)) {
                            setFormData(prev => ({
                              ...prev,
                              hashTagList: [...(prev.hashTagList || []), tag]
                            }));
                            setHashTagInput('');
                            setShowSuggestions(false);
                          }
                        }}
                        colorScheme="blue"
                        size="md"
                      >
                        Add
                      </Button>
                    </Flex>
                    
                    {/* Hashtag suggestions dropdown */}
                    {showSuggestions && hashTagSuggestions.length > 0 && (
                      <Box
                        position="absolute"
                        top="100%"
                        left="0"
                        right="0"
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="md"
                        zIndex="10"
                        maxH="200px"
                        overflowY="auto"
                      >
                        {hashTagSuggestions.map((suggestion, index) => (
                          <Box
                            key={index}
                            px={3}
                            py={2}
                            cursor="pointer"
                            _hover={{ bg: "gray.50" }}
                            onClick={() => {
                              if (!formData.hashTagList?.includes(suggestion)) {
                                setFormData(prev => ({
                                  ...prev,
                                  hashTagList: [...(prev.hashTagList || []), suggestion]
                                }));
                              }
                              setHashTagInput('');
                              setShowSuggestions(false);
                            }}
                          >
                            <Text fontSize="sm">#{suggestion}</Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                  {formData.hashTagList && formData.hashTagList.length > 0 && (
                    <Flex wrap="wrap" gap={2}>
                      {formData.hashTagList.map((tag, index) => (
                        <Flex
                          key={index}
                          align="center"
                          bg="blue.100"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="sm"
                        >
                          <Text>#{tag}</Text>
                          <IconButton
                            aria-label="Remove hashtag"
                            icon={<CloseIcon />}
                            size="xs"
                            variant="ghost"
                            ml={1}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                hashTagList: prev.hashTagList?.filter((_, i) => i !== index) || []
                              }));
                            }}
                          />
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel>Images</FormLabel>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <Flex direction="column" gap={4}>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    colorScheme="teal"
                    size="md"
                    width="fit-content"
                  >
                    Select Images
                  </Button>

                  {selectedFiles.length > 0 && (
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text>{selectedFiles.length} file(s) selected</Text>
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={handleFileUpload}
                          isLoading={uploading}
                          loadingText="Uploading"
                          isDisabled={selectedFiles.length === 0}
                        >
                          Upload Files
                        </Button>
                      </Flex>

                      <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={4}>
                        {selectedFiles.map((file, index) => (
                          <Box key={index} position="relative" borderWidth="1px" borderRadius="md" overflow="hidden">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              objectFit="cover"
                              height="100px"
                              width="100%"
                            />
                            <IconButton
                              aria-label="Remove image"
                              icon={<CloseIcon />}
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top={1}
                              right={1}
                              onClick={() => handleFileRemove(index)}
                            />
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {uploadedFiles.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Uploaded Images:</Text>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {uploadedFiles.map((file) => (
                          <Box key={file.id} borderWidth="1px" borderRadius="md" overflow="hidden">
                            <Image
                              src={file.fileUrl}
                              alt={file.originalFileName}
                              objectFit="cover"
                              height="100px"
                              width="100%"
                            />
                            <Text fontSize="xs" p={1} noOfLines={1}>{file.originalFileName}</Text>
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {uploadError && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {uploadError}
                    </Alert>
                  )}
                </Flex>
              </FormControl>

              {selectedMap && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Selected map: {selectedMap.name} (ID: {selectedMap.id})
                </Alert>
              )}

              {selectedLocation && !selectedMap && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Selected location: {selectedLocation.address}
                </Alert>
              )}

              <Button 
                type="submit" 
                colorScheme="blue" 
                isLoading={submitting}
                loadingText="Creating"
                mt={4}
              >
                Create Memory
              </Button>
            </VStack>
          </form>
        </Box>

        {/* Map section */}
        <Box width={{ base: '100%', md: '60%' }} height="500px" position="relative">
          {loading && (
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              width="100%" 
              height="100%" 
              bg="rgba(255, 255, 255, 0.7)" 
              zIndex="1" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Spinner size="xl" />
            </Box>
          )}

          {error && (
            <Box 
              position="absolute" 
              top="4" 
              left="4" 
              zIndex="1" 
              maxWidth="80%"
            >
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            </Box>
          )}

          <Box mb={4}>
            <Text fontWeight="bold">Click on a map marker to select a location for your memory</Text>
          </Box>

          <GoogleMap 
            apiKey={googleMapsApiKey} 
            maps={maps}
            onMapSelect={handleMapClick}
            onLocationSelect={handleLocationSelect}
          />
        </Box>
      </Flex>
    </Container>
  );
};

export default CreateMemoryPage;
