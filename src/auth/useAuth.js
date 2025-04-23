// Custom hook to access authentication context
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => useContext(AuthContext);
