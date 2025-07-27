import React from 'react';
import PublicMemoriesPage from '../components/PublicMemoriesPage';

const SharingMemoriesPage: React.FC = () => {
  return <PublicMemoriesPage title="🌟 함께 나누는 추억들" requireAuth={false} />;
};

export default SharingMemoriesPage;
