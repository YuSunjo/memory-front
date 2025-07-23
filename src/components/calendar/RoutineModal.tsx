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
import type { RoutineRequest, RoutineResponse } from '../../types/calendar';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoutineRequest, routineId?: number) => void;
  isLoading: boolean;
  apiError?: string | null;
  editingRoutine?: RoutineResponse | null;
}

const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  apiError,
  editingRoutine
}) => {
  // Form state
  const [routineForm, setRoutineForm] = useState<RoutineRequest>({
    title: '',
    content: '',
    repeatType: 'DAILY',
    interval: 1,
    startDate: new Date().toISOString().split('T')[0], // Today's date
    endDate: null
  });

  // Update form when editing routine changes
  React.useEffect(() => {
    if (editingRoutine) {
      setRoutineForm({
        title: editingRoutine.title,
        content: editingRoutine.content,
        repeatType: editingRoutine.repeatType,
        interval: editingRoutine.interval,
        startDate: editingRoutine.startDate,
        endDate: editingRoutine.endDate
      });
    } else {
      setRoutineForm({
        title: '',
        content: '',
        repeatType: 'DAILY',
        interval: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: null
      });
    }
  }, [editingRoutine]);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    startDate: '',
    interval: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'endDate' && value === '') {
      setRoutineForm(prev => ({ ...prev, [name]: null }));
    } else {
      setRoutineForm(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle number input changes
  const handleNumberInputChange = (value: string) => {
    const numberValue = parseInt(value) || 1;
    setRoutineForm(prev => ({ ...prev, interval: numberValue }));

    // Clear validation error when user types
    if (formErrors.interval) {
      setFormErrors(prev => ({ ...prev, interval: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!routineForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!routineForm.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    if (!routineForm.startDate) {
      newErrors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!routineForm.interval || routineForm.interval < 1) {
      newErrors.interval = 'Interval must be at least 1';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(routineForm, editingRoutine?.id);
  };

  // Reset form when modal closes
  const handleClose = () => {
    setRoutineForm({
      title: '',
      content: '',
      repeatType: 'DAILY',
      interval: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null
    });
    setFormErrors({
      title: '',
      content: '',
      startDate: '',
      interval: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editingRoutine ? 'Edit Routine' : 'Create New Routine'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!formErrors.title} mb={4}>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={routineForm.title}
              onChange={handleInputChange}
              placeholder="Enter routine title"
            />
            {formErrors.title && <FormErrorMessage>{formErrors.title}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.content} mb={4}>
            <FormLabel>Content</FormLabel>
            <Textarea
              name="content"
              value={routineForm.content}
              onChange={handleInputChange}
              placeholder="Enter routine description"
            />
            {formErrors.content && <FormErrorMessage>{formErrors.content}</FormErrorMessage>}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Repeat Type</FormLabel>
            <Select
              name="repeatType"
              value={routineForm.repeatType}
              onChange={handleInputChange}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!formErrors.interval} mb={4}>
            <FormLabel>Repeat Every</FormLabel>
            <NumberInput
              min={1}
              value={routineForm.interval}
              onChange={handleNumberInputChange}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formErrors.interval && <FormErrorMessage>{formErrors.interval}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.startDate} mb={4}>
            <FormLabel>Start Date</FormLabel>
            <Input
              name="startDate"
              type="date"
              value={routineForm.startDate}
              onChange={handleInputChange}
            />
            {formErrors.startDate && <FormErrorMessage>{formErrors.startDate}</FormErrorMessage>}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>End Date (Optional)</FormLabel>
            <Input
              name="endDate"
              type="date"
              value={routineForm.endDate || ''}
              onChange={handleInputChange}
            />
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
            {editingRoutine ? 'Update Routine' : 'Create Routine'}
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoutineModal;