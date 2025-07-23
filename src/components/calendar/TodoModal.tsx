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
  Button,
  FormErrorMessage
} from '@chakra-ui/react';
import type {TodoRequest} from '../../types/calendar';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: TodoRequest;
  isLoading: boolean;
  onSubmit: (data: TodoRequest) => void;
  apiError?: string;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isLoading,
  onSubmit,
  apiError
}) => {
  // Form state
  const [todoForm, setTodoForm] = useState<TodoRequest>(initialData);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    dueDate: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTodoForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!todoForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!todoForm.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!todoForm.dueDate) {
      newErrors.dueDate = 'Due date is required';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(todoForm);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Todo</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!formErrors.title} mb={4}>
            <FormLabel>Title</FormLabel>
            <Input 
              name="title"
              value={todoForm.title}
              onChange={handleInputChange}
              placeholder="Enter todo title"
            />
            {formErrors.title && <FormErrorMessage>{formErrors.title}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.content} mb={4}>
            <FormLabel>Content</FormLabel>
            <Textarea 
              name="content"
              value={todoForm.content}
              onChange={handleInputChange}
              placeholder="Enter todo description"
            />
            {formErrors.content && <FormErrorMessage>{formErrors.content}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.dueDate} mb={4}>
            <FormLabel>Due Date & Time</FormLabel>
            <Input 
              name="dueDate"
              type="datetime-local"
              value={todoForm.dueDate}
              onChange={handleInputChange}
            />
            {formErrors.dueDate && <FormErrorMessage>{formErrors.dueDate}</FormErrorMessage>}
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

export default TodoModal;
