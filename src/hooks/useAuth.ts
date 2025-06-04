import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMemberStore from '../store/memberStore';

const useAuth = (requireAuth: boolean = false, redirectTo: string = '/login') => {
  const { member, isAuthenticated, isLoading, error, fetchMemberInfo } = useMemberStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        fetchMemberInfo();
      } else {
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth, redirectTo, fetchMemberInfo]);

  return { member, isAuthenticated, isLoading, error };
};

export default useAuth;
