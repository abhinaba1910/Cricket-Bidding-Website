import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            toast.error('Your session has expired. Please log in again.');
            setTimeout(() => {
              navigate('/');
            }, 1000); // 1 second delay
          }
        } catch (error) {
          console.error('Token decoding error:', error);
          localStorage.removeItem('token');
          toast.error('Invalid session. Please log in again.');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
};

export default AutoLogout;
