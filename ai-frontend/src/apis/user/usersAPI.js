import axios from "axios";
//=======Registration=====

export const registerAPI = async (userData) => {
  const response = await axios.post(
    "http://localhost:3000/api/v1/users/register",
    {
      email: userData?.email,
      password: userData?.password,
      confirmPassword : userData?.confirmPassword,
      firstName: userData?.firstName,
      lastName: userData?.lastName,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Login=====

export const loginAPI = async (userData) => {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/users/login', userData);
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
    "http://localhost:3000/api/v1/users/auth/check",
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Logout =====

export const logoutAPI = async () => {
  const response = await axios.post(
    "http://localhost:3000/api/v1/users/logout",
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Logout =====

export const getUserProfileAPI = async () => {
  const token = localStorage.getItem("token");
  console.log("Token retrieved from localStorage:", token); // For debugging

  if (!token) {
    throw new Error("No token found. Please log in again.");
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get("http://localhost:3000/api/v1/users/profile", config);
    return response.data;
  } catch (error) {
    console.error("Error in getUserProfileAPI:", error);
    throw error;
  }
};

export const googleSignInAPI = async (tokenId) => {
  try {
    const response = await axios.post('/api/users/google-signin', { tokenId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
