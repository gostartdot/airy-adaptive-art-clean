import type { AppDispatch } from '../../store/types';
import { setCredentials, setLoading, clearSignupData } from '../../store/authSlice';
import api from '../api';

export const login = async (email: string, password: string, navigate: any, dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { user, token } = response.data.data;
      dispatch(setCredentials({ user, token }));
      navigate('/admin');
    } else {
      alert(response.data.message || 'Login failed');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    alert(error.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    dispatch(setLoading(false));
  }
};

export const sendOtp = (email: string, navigate: any) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      
      const response = await api.post('/auth/send-otp', { email });
      
      if (response.data.success) {
        navigate('/verify-email');
      } else {
        alert(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      alert(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const signUp = (
  accountType: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
  otp: string,
  navigate: any
) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      
      const signupData = {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      };
      
      console.log('Sending signup data:', signupData);
      
      const response = await api.post('/auth/admin-signup', signupData);

      if (response.data.success) {
        const { user, token } = response.data.data;
        dispatch(setCredentials({ user, token }));
        dispatch(clearSignupData());
        navigate('/admin');
      } else {
        alert(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || error.message || 'Signup failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };
};
