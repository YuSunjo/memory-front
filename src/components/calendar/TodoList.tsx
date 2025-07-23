import React from 'react';
import { 
  Box, 
  Text, 
  Checkbox, 
  Spinner, 
  Center, 
  Heading, 
  Button, 
  Flex 
} from '@chakra-ui/react';
import type {TodoResponse, RoutinePreview} from '../../types/calendar';

interface TodoListProps {
  selectedDate: Date | null;
  todos: TodoResponse[];
  routinePreviews: RoutinePreview[];
  isLoading: boolean;
  onToggleTodo: (id: number) => void;
  onConvertRoutineToTodo: (routineId: number, targetDate: string) => void;
  onOpenCreateModal: () => void;
  onOpenRoutineModal: () => void;
}

const TodoList: React.FC<TodoListProps> = ({
  selectedDate,
  todos,
  routinePreviews,
  isLoading,
  onToggleTodo,
  onConvertRoutineToTodo,
  onOpenCreateModal,
  onOpenRoutineModal
}) => {
  // Get todo items for a specific date
  const getTodoItems = (date: Date | null): TodoResponse[] => {
    if (!date) return [];
    return todos.filter(todo => {
      const todoDate = new Date(todo.dueDate);
      return todoDate.getDate() === date.getDate() && 
             todoDate.getMonth() === date.getMonth() && 
             todoDate.getFullYear() === date.getFullYear();
    });
  };

  // Get routine previews for a specific date
  const getRoutinePreviewsForDate = (date: Date | null): RoutinePreview[] => {
    if (!date) return [];
    const targetDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD format (local)
    return routinePreviews.filter(preview => preview.targetDate === targetDateStr);
  };

  // Check if a date has todo items
  const hasTodoItems = (date: Date | null): boolean => {
    return getTodoItems(date).length > 0;
  };

  // Check if a date has routine previews
  const hasRoutinePreviews = (date: Date | null): boolean => {
    return getRoutinePreviewsForDate(date).length > 0;
  };

  // Check if date has any items (todos or routine previews)
  const hasAnyItems = (date: Date | null): boolean => {
    return hasTodoItems(date) || hasRoutinePreviews(date);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h4" size="md">Todo List</Heading>
        <Flex gap={2}>
          <Button 
            colorScheme="green" 
            size="sm" 
            onClick={onOpenRoutineModal}
          >
            Create Routine
          </Button>
          <Button 
            colorScheme="blue" 
            size="sm" 
            onClick={onOpenCreateModal}
            isDisabled={!selectedDate}
          >
            Create Todo
          </Button>
        </Flex>
      </Flex>
      {isLoading ? (
        <Center p={4}>
          <Spinner />
        </Center>
      ) : !selectedDate ? (
        <Text>Select a date to view todo items.</Text>
      ) : hasAnyItems(selectedDate) ? (
        <>
          <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Items:</Text>
          
          {/* Actual Todos */}
          {getTodoItems(selectedDate).map(todo => (
            <Box key={`todo-${todo.id}`} p={2} bg="gray.50" borderRadius="md" mb={2}>
              <Checkbox 
                isChecked={todo.completed} 
                onChange={() => onToggleTodo(todo.id)}
                colorScheme="blue"
              >
                <Text noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                  {todo.title}
                  {todo.routine && (
                    <Text as="span" ml={2} fontSize="xs" color="orange.500">
                      (From Routine)
                    </Text>
                  )}
                </Text>
              </Checkbox>
            </Box>
          ))}
          
          {/* Routine Previews */}
          {getRoutinePreviewsForDate(selectedDate).map(preview => (
            <Box 
              key={`routine-${preview.routineId}-${preview.targetDate}`} 
              p={2} 
              bg="orange.50" 
              borderRadius="md" 
              mb={2}
              opacity={0.7}
              border="1px dashed"
              borderColor="orange.200"
            >
              <Checkbox 
                isChecked={false}
                colorScheme="orange"
                onChange={() => onConvertRoutineToTodo(preview.routineId, preview.targetDate)}
              >
                <Text 
                  noOfLines={1} 
                  overflow="hidden" 
                  textOverflow="ellipsis"
                  color="orange.600"
                  fontStyle="italic"
                >
                  {preview.title}
                </Text>
              </Checkbox>
            </Box>
          ))}
        </>
      ) : (
        <Text>No items for {selectedDate.toLocaleDateString()}.</Text>
      )}
    </Box>
  );
};

export default TodoList;