import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { registerAPI } from "../../apis/user/usersAPI";
import StatusMessage from "../Alert/StatusMessage";
import SuccessModal from "./SuccessModal";
import { useAuth } from '../../AuthContext/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import LoadingSpinner from './LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  firstName: Yup.string().required("First name is required"), // Validation for first name
  lastName: Yup.string().required("Last name is required"),   // Validation for last name
});

const Registration = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Remove the isLoading state as we'll use mutation.isPending
  // const [isLoading, setLoading] = useState(false);
  //custom auth hook
  const { isAuthenticated, loginUser } = useAuth();
  const navigate = useNavigate();
  //Redirect if a user is login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Add this console log to debug
  useEffect(() => {
    console.log("Register page loaded");
    console.log("Window google object:", window.google);
    console.log("Current URL:", window.location.href);
    
    // Add this to check if Google OAuth is properly initialized
    const initializeGoogleAuth = async () => {
      try {
        if (window.google?.accounts?.id) {
          await window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
            ux_mode: 'popup',
            context: 'signup',
            auto_select: false,
            itp_support: true
          });
          
          // Add this to render the button programmatically
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'filled_blue',
              size: 'large',
              text: 'signup_with',
              width: 400,
              shape: 'rectangular'
            }
          );
          
          console.log("Google OAuth initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize Google OAuth:", error);
      }
    };

    initializeGoogleAuth();
  }, []);

  // Add this function to send registration email
  const sendRegistrationEmail = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/email/registration`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      });

      if (response.data.success) {
        console.log('Registration notification email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send registration notification email:', error);
    }
  };

  //mutation
  const mutation = useMutation({
    mutationFn: registerAPI,
    onSuccess: async (data) => {
      if (data.status === "success") {
        // Send registration email
        await sendRegistrationEmail({
          firstName: formik.values.firstName,
          lastName: formik.values.lastName,
          email: formik.values.email
        });
        setShowSuccessModal(true);
      } else {
        console.error("Registration failed", data);
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
    }
  });

  // Formik setup for form handling
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "", // Added confirmPassword
      firstName: "", // Changed from username to firstName
      lastName: "",  // Added lastName
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], "Passwords must match") // Validation for password confirmation
        .required("Password confirmation is required"),
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
    }),
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });
  console.log(mutation.isSuccess);
  console.log(mutation.isPending);
  console.log(mutation.isError);
  console.log(mutation.error);
  console.log(mutation);

  // Add Google Sign up handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/auth/google`,
        {
          email: decoded.email,
          googleId: decoded.sub,
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          provider: 'google'
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === "success") {
        // Check if this is an existing user
        const isExistingUser = response.data.isExistingUser;

        if (isExistingUser) {
          // Show popup for existing user
          toast.info("You are already registered. Hence you have been logged in automatically.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          // Show success message for new users
          toast.success("Congratulations! Your account has been created successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Send registration email for new users
          await sendRegistrationEmail({
            firstName: decoded.given_name,
            lastName: decoded.family_name,
            email: decoded.email
          });
        }
        
        // Login and redirect for both cases
        await loginUser({
          token: response.data.token,
          user: response.data.user
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google signup failed:", error);
      toast.error("Registration failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        console.log("Initializing Google Sign-in");
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
            ux_mode: 'popup',
            context: 'signup'
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'filled_blue',
              size: 'large',
              text: 'signup_with',
              width: 400
            }
          );
          console.log("Google Sign-in initialized successfully");
        } catch (error) {
          console.error("Error initializing Google Sign-in:", error);
        }
      } else {
        retryCount++;
        console.log(`Google library not yet available, retry ${retryCount} of ${maxRetries}`);
        
        if (retryCount < maxRetries) {
          setTimeout(initializeGoogleSignIn, 1000); // Increased delay to 1 second
        } else {
          console.error("Failed to load Google Sign-in after maximum retries");
        }
      }
    };

    // Load the Google script manually if it's not present
    if (!document.querySelector('script#google-client')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    // Cleanup function
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return (   
    <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-20">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 m-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create an Account
        </h2>
        
        <div className="mb-4">
          <div 
            id="google-signin-button" 
            className="w-full flex justify-center"
          ></div>
        </div>

        <div className="relative mb-4">
          <hr className="border-t border-gray-300" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-sm text-gray-500">
            OR
          </span>
        </div>

        <p className="text-center text-gray-600 mb-4">
          Create an account using your own email ID.
        </p>

        {/* display loading */}
        {mutation.isLoading && (
          <StatusMessage type="loading" message="Registering..." />
        )}
        {/* display error */}
        {mutation.isError && (
          <StatusMessage
            type="error"
            // message={mutation?.error?.response?.data?.message}
            message={mutation.error?.response?.data?.message || "Registration failed abruptly"}
          />
        )}
        {/* display success */}
        {showSuccessModal && (
          <SuccessModal
            onClose={() => setShowSuccessModal(false)}
          />
        )}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* First Name input field */}
          <div>
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              {...formik.getFieldProps("firstName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="John"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className="text-red-500 mt-1">{formik.errors.firstName}</div>
            )}
          </div>

          {/* Last Name input field */}
          <div>
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              {...formik.getFieldProps("lastName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="Doe"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className="text-red-500 mt-1">{formik.errors.lastName}</div>
            )}
          </div>

          {/* Email input field */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...formik.getFieldProps("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="you@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 mt-1">{formik.errors.email}</div>
            )}
          </div>

          {/* Password input field */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...formik.getFieldProps("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 mt-1">{formik.errors.password}</div>
            )}
          </div>

          {/* Password Confirmation input field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 block mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...formik.getFieldProps("confirmPassword")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 mt-1">{formik.errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                <span>Registering...</span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
        <div className="text-sm mt-2 text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;
