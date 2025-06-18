import React from 'react';
import { 
  Box, 
  Text, 
  Spinner, 
  Center, 
  Heading, 
  Button, 
  Flex 
} from '@chakra-ui/react';
import type {DiaryResponse} from '../../types/calendar';

interface DiaryListProps {
  selectedDate: Date | null;
  diaries: DiaryResponse[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
}

const DiaryList: React.FC<DiaryListProps> = ({
  selectedDate,
  diaries,
  isLoading,
  onOpenCreateModal
}) => {
  // Get diary entries for a specific date
  const getDiaryEntries = (date: Date | null): DiaryResponse[] => {
    if (!date) return [];
    return diaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getDate() === date.getDate() && 
             diaryDate.getMonth() === date.getMonth() && 
             diaryDate.getFullYear() === date.getFullYear();
    });
  };

  // Check if a date has diary entries
  const hasDiaryEntries = (date: Date | null): boolean => {
    return getDiaryEntries(date).length > 0;
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h4" size="md">Diary Entries</Heading>
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
        <Text>Select a date to view diary entries.</Text>
      ) : hasDiaryEntries(selectedDate) ? (
        <>
          <Text fontWeight="bold" mb={2}>{selectedDate.toLocaleDateString()} Diary Entries:</Text>
          {getDiaryEntries(selectedDate).map(diary => (
            <Box key={diary.id} p={3} bg="gray.50" borderRadius="md" mb={2}>
              <Text fontWeight="bold">{diary.title}</Text>
              <Text>{diary.content}</Text>
              <Flex mt={2} fontSize="sm" color="gray.500">
                <Text mr={2}>Mood: {diary.mood}</Text>
                <Text>Weather: {diary.weather}</Text>
              </Flex>
            </Box>
          ))}
        </>
      ) : (
        <Text>No diary entries for {selectedDate.toLocaleDateString()}.</Text>
      )}
    </Box>
  );
};

export default DiaryList;