import axios from "axios";
//=======Registration=====

export const registerAPI = async (userData) => {
  console.log('Starting registration request', userData);
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/register`,
      userData,
      {
        withCredentials: true
      }
    );
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
};
//=======Login=====

export const loginAPI = async (userData) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, userData);
    console.log("Raw API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login API error:", error.response?.data);
    throw error;
  }
};
//=======Check auth=====

export const checkUserAuthStatusAPI = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/users/auth/check`,
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Logout =====

export const logoutAPI = async () => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/users/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Logout =====

export const getUserProfileAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const googleSignInAPI = async (tokenId) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/google-signin`, { tokenId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionDetailsAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/users/subscription-details`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentHistoryAPI = async (page = 1) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/users/billing-history?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscriptionAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.patch(
      `${process.env.REACT_APP_API_URL}/users/cancel-subscription`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

