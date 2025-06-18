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
import type {TodoResponse} from '../../types/calendar';

interface TodoListProps {
  selectedDate: Date | null;
  todos: TodoResponse[];
  isLoading: boolean;
  onToggleTodo: (id: number) => void;
  onOpenCreateModal: () => void;
}

const TodoList: React.FC<TodoListProps> = ({
  selectedDate,
  todos,
  isLoading,
  onToggleTodo,
  onOpenCreateModal
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

  // Check if a date has todo items
  const hasTodoItems = (date: Date | null): boolean => {
    return getTodoItems(date).length > 0;
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h4" size="md">Todo List</Heading>
        <Button 
          colorScheme="blue" 
          size="sm" 
          onClick={onOpenCreateModal}
          isDisabled={!selectedDate}
        >
          Create
        </Button>
      </Flex>
      {isLoading ? (
        <Center p={4}>
          <Spinner />
        </Center>
      ) : !selectedDate ? (
        <Text>Select a date to view todo items.</Text>
      ) : hasTodoItems(selectedDate) ? (
        <>
          <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Todo Items:</Text>
          {getTodoItems(selectedDate).map(todo => (
            <Box key={todo.id} p={2} bg="gray.50" borderRadius="md" mb={2}>
              <Checkbox 
                isChecked={todo.completed} 
                onChange={() => onToggleTodo(todo.id)}
                colorScheme="blue"
              >
                <Text noOfLines={1} overflow="hidden" textOverflow="ellipsis">
                  {todo.title}
                </Text>
              </Checkbox>
            </Box>
          ))}
        </>
      ) : (
        <Text>No todo items for {selectedDate.toLocaleDateString()}.</Text>
      )}
    </Box>
  );
};

export default TodoList;