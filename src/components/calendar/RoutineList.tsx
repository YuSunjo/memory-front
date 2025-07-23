import React from 'react';
import { 
  Box, 
  Text, 
  Spinner, 
  Center, 
  Heading, 
  Button, 
  Flex,
  Badge,
  VStack,
  HStack,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import type { RoutineResponse } from '../../types/calendar';

interface RoutineListProps {
  routines: RoutineResponse[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
  onEditRoutine: (routine: RoutineResponse) => void;
  onDeleteRoutine: (id: number) => void;
  onToggleActive: (id: number) => void;
}

const RoutineList: React.FC<RoutineListProps> = ({
  routines,
  isLoading,
  onOpenCreateModal,
  onEditRoutine,
  onDeleteRoutine,
  onToggleActive
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getRepeatTypeLabel = (repeatType: string, interval: number) => {
    const labels = {
      'DAILY': interval === 1 ? 'Daily' : `Every ${interval} days`,
      'WEEKLY': interval === 1 ? 'Weekly' : `Every ${interval} weeks`,
      'MONTHLY': interval === 1 ? 'Monthly' : `Every ${interval} months`
    };
    return labels[repeatType as keyof typeof labels] || repeatType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h4" size="md">Routine List</Heading>
        <Button 
          colorScheme="green" 
          size="sm" 
          onClick={onOpenCreateModal}
        >
          Create Routine
        </Button>
      </Flex>
      
      {isLoading ? (
        <Center p={4}>
          <Spinner />
        </Center>
      ) : routines.length === 0 ? (
        <Text>No routines created yet.</Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {routines.map(routine => (
            <Box 
              key={routine.id} 
              p={4} 
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              opacity={routine.active ? 1 : 0.6}
            >
              <Flex justify="space-between" align="flex-start">
                <VStack align="flex-start" spacing={2} flex={1}>
                  <HStack>
                    <Text fontWeight="bold" fontSize="lg">
                      {routine.title}
                    </Text>
                    <Badge 
                      colorScheme={routine.active ? "green" : "gray"}
                      cursor="pointer"
                      onClick={() => onToggleActive(routine.id)}
                    >
                      {routine.active ? "Active" : "Inactive"}
                    </Badge>
                  </HStack>
                  
                  <Text color="gray.600">
                    {routine.content}
                  </Text>
                  
                  <HStack spacing={4} fontSize="sm" color="gray.500">
                    <Text>
                      <strong>Repeat:</strong> {getRepeatTypeLabel(routine.repeatType, routine.interval)}
                    </Text>
                    <Text>
                      <strong>Start:</strong> {formatDate(routine.startDate)}
                    </Text>
                    {routine.endDate && (
                      <Text>
                        <strong>End:</strong> {formatDate(routine.endDate)}
                      </Text>
                    )}
                  </HStack>
                </VStack>
                
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit routine"
                    icon={<EditIcon />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => onEditRoutine(routine)}
                  />
                  <IconButton
                    aria-label="Delete routine"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDeleteRoutine(routine.id)}
                  />
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default RoutineList;