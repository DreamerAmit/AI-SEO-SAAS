import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const res = await axios.get(`/api/auth/confirm-email/${token}`);
        setMessage(res.data.message);
      } catch (error) {
        setMessage(error.response.data.message || 'An error occurred');
      }
    };

    confirmEmail();
  }, [token]);

  return <div>{message}</div>;
};

export default ConfirmEmail;
