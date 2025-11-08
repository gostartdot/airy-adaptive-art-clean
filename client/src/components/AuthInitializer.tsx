import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth } from '../store/authSlice';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore authentication state from localStorage on app load
    dispatch(restoreAuth());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;


