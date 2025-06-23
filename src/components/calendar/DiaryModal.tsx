import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  FormErrorMessage
} from '@chakra-ui/react';
import type {DiaryRequest} from '../../types/calendar';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: DiaryRequest;
  isLoading: boolean;
  onSubmit: (data: DiaryRequest) => void;
  apiError?: string;
}

const DiaryModal: React.FC<DiaryModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isLoading,
  onSubmit,
  apiError
}) => {
  // Form state
  const [diaryForm, setDiaryForm] = useState<DiaryRequest>(initialData);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    date: '',
    mood: '',
    weather: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDiaryForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!diaryForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!diaryForm.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!diaryForm.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!diaryForm.mood.trim()) {
      newErrors.mood = 'Mood is required';
      isValid = false;
    }

    if (!diaryForm.weather.trim()) {
      newErrors.weather = 'Weather is required';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(diaryForm);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Diary Entry</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!formErrors.title} mb={4}>
            <FormLabel>Title</FormLabel>
            <Input 
              name="title"
              value={diaryForm.title}
              onChange={handleInputChange}
              placeholder="Enter diary title"
            />
            {formErrors.title && <FormErrorMessage>{formErrors.title}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.content} mb={4}>
            <FormLabel>Content</FormLabel>
            <Textarea 
              name="content"
              value={diaryForm.content}
              onChange={handleInputChange}
              placeholder="Enter diary content"
              minH="150px"
            />
            {formErrors.content && <FormErrorMessage>{formErrors.content}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.date} mb={4}>
            <FormLabel>Date</FormLabel>
            <Input 
              name="date"
              type="date"
              value={diaryForm.date}
              onChange={handleInputChange}
            />
            {formErrors.date && <FormErrorMessage>{formErrors.date}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.mood} mb={4}>
            <FormLabel>Mood</FormLabel>
            <Select 
              name="mood"
              value={diaryForm.mood}
              onChange={handleInputChange}
            >
              <option value="행복">행복</option>
              <option value="기쁨">기쁨</option>
              <option value="슬픔">슬픔</option>
              <option value="화남">화남</option>
              <option value="평온">평온</option>
            </Select>
            {formErrors.mood && <FormErrorMessage>{formErrors.mood}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.weather} mb={4}>
            <FormLabel>Weather</FormLabel>
            <Select 
              name="weather"
              value={diaryForm.weather}
              onChange={handleInputChange}
            >
              <option value="맑음">맑음</option>
              <option value="흐림">흐림</option>
              <option value="비">비</option>
              <option value="눈">눈</option>
              <option value="안개">안개</option>
            </Select>
            {formErrors.weather && <FormErrorMessage>{formErrors.weather}</FormErrorMessage>}
          </FormControl>
          {apiError && (
            <FormControl isInvalid={!!apiError} mb={4}>
              <FormErrorMessage color="red.500">{apiError}</FormErrorMessage>
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Create
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DiaryModal;
