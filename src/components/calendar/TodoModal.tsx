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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isLoading,
  onSubmit
}) => {
  // Form state
  const [todoForm, setTodoForm] = useState<TodoRequest>(initialData);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    dueDate: '',
    repeatInterval: '',
    repeatEndDate: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTodoForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle number input changes
  const handleNumberInputChange = (name: string, value: string) => {
    const numberValue = parseInt(value);
    setTodoForm(prev => ({ ...prev, [name]: numberValue }));

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

    if (todoForm.repeatType !== 'NONE') {
      if (!todoForm.repeatInterval || todoForm.repeatInterval < 1) {
        newErrors.repeatInterval = 'Repeat interval must be at least 1';
        isValid = false;
      }

      if (!todoForm.repeatEndDate) {
        newErrors.repeatEndDate = 'Repeat end date is required';
        isValid = false;
      }
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

          <FormControl mb={4}>
            <FormLabel>Repeat</FormLabel>
            <Select 
              name="repeatType"
              value={todoForm.repeatType}
              onChange={handleInputChange}
            >
              <option value="NONE">No Repeat</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </Select>
          </FormControl>

          {todoForm.repeatType !== 'NONE' && (
            <>
              <FormControl isInvalid={!!formErrors.repeatInterval} mb={4}>
                <FormLabel>Repeat Every</FormLabel>
                <NumberInput 
                  min={1} 
                  value={todoForm.repeatInterval}
                  onChange={(value) => handleNumberInputChange('repeatInterval', value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {formErrors.repeatInterval && <FormErrorMessage>{formErrors.repeatInterval}</FormErrorMessage>}
              </FormControl>

              <FormControl isInvalid={!!formErrors.repeatEndDate} mb={4}>
                <FormLabel>Repeat Until</FormLabel>
                <Input 
                  name="repeatEndDate"
                  type="date"
                  value={todoForm.repeatEndDate}
                  onChange={handleInputChange}
                />
                {formErrors.repeatEndDate && <FormErrorMessage>{formErrors.repeatEndDate}</FormErrorMessage>}
              </FormControl>
            </>
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