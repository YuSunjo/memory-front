import React from 'react';
import PublicMemoriesPage from '../components/PublicMemoriesPage';

const SharingMemoriesPage: React.FC = () => {
  return <PublicMemoriesPage title="Sharing Memories" requireAuth={false} />;
};

export default SharingMemoriesPage;
