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
  FormErrorMessage,
  Checkbox
} from '@chakra-ui/react';
import type {EventRequest} from '../../types/calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: EventRequest;
  isLoading: boolean;
  onSubmit: (data: EventRequest) => void;
  apiError?: string;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isLoading,
  onSubmit,
  apiError
}) => {
  // Form state
  const [eventForm, setEventForm] = useState<EventRequest>({
    ...initialData,
    isDday: false,
    repeatType: 'NONE',
    repeatInterval: 1,
    repeatEndDate: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEventForm(prev => ({ ...prev, [name]: checked }));
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!eventForm.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!eventForm.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!eventForm.startDateTime) {
      newErrors.startDateTime = 'Start date and time is required';
      isValid = false;
    }

    if (!eventForm.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(eventForm);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={!!formErrors.title} mb={4}>
            <FormLabel>Title</FormLabel>
            <Input 
              name="title"
              value={eventForm.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
            />
            {formErrors.title && <FormErrorMessage>{formErrors.title}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.description} mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea 
              name="description"
              value={eventForm.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
            />
            {formErrors.description && <FormErrorMessage>{formErrors.description}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.startDateTime} mb={4}>
            <FormLabel>Start Date & Time</FormLabel>
            <Input 
              name="startDateTime"
              type="datetime-local"
              value={eventForm.startDateTime}
              onChange={handleInputChange}
            />
            {formErrors.startDateTime && <FormErrorMessage>{formErrors.startDateTime}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.endDateTime} mb={4}>
            <FormLabel>End Date & Time (Optional)</FormLabel>
            <Input 
              name="endDateTime"
              type="datetime-local"
              value={eventForm.endDateTime}
              onChange={handleInputChange}
            />
            {formErrors.endDateTime && <FormErrorMessage>{formErrors.endDateTime}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!formErrors.location} mb={4}>
            <FormLabel>Location</FormLabel>
            <Input 
              name="location"
              value={eventForm.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
            />
            {formErrors.location && <FormErrorMessage>{formErrors.location}</FormErrorMessage>}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Event Type</FormLabel>
            <Select 
              name="eventType"
              value={eventForm.eventType}
              onChange={handleInputChange}
            >
              <option value="PERSONAL">Personal</option>
              <option value="ANNIVERSARY_EVENT">ANNIVERSARY</option>
              <option value="RELATIONSHIP_EVENT">RELATIONSHIP</option>
            </Select>
          </FormControl>

          {eventForm.eventType === "ANNIVERSARY_EVENT" && (
            <FormControl mb={4}>
              <Checkbox 
                name="isDday"
                isChecked={eventForm.isDday}
                onChange={handleCheckboxChange}
              >
                Mark as D-Day
              </Checkbox>
            </FormControl>
          )}

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

export default EventModal;
