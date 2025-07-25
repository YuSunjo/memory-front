import useApi from './useApi';

interface HashtagItem {
  id: number;
  name: string;
  useCount: number;
}


const useHashtagService = () => {
  const api = useApi();

  const searchHashtags = async (keyword: string, limit: number = 5): Promise<string[]> => {
    try {
      if (!keyword.trim()) {
        return [];
      }
      
      const response = await api.get(`/hashtag/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`);
      const data = response.data.data as HashtagItem[];
      return data.map((item: HashtagItem) => item.name) || [];
    } catch (error) {
      console.error('Error searching hashtags:', error);
      return [];
    }
  };

  return {
    searchHashtags
  };
};

export default useHashtagService;