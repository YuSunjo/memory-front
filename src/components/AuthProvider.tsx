import React from 'react';
import useMemberStore from '../store/memberStore';
import { useEffect } from 'react';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, fetchMemberInfo } = useMemberStore();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isAuthenticated) {
      fetchMemberInfo();
    }
  }, [isAuthenticated, fetchMemberInfo]);

  return <>{children}</>;
};

export default AuthProvider;