import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginAPI } from "../../apis/user/usersAPI";
import StatusMessage from "../Alert/StatusMessage";
import { useAuth } from "../../AuthContext/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      console.log("Full login API response:", data);
      if (data && data.status === "success" && data.token) {
        loginUser({
          token: data.token,
          user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName
          }
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        }));
        console.log(data.user.firstName, data.user.lastName, data.user.email);
        console.log("User logged in, navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.error("Login API did not return expected data. Full response:", data);
      }
    },
    onError: (error) => {
      console.error("Login failed", error);
      console.error("Error response:", error.response?.data);
    }
  });

  // Reset mutation state when component unmounts
  useEffect(() => {
    return () => {
      loginMutation.reset();
    };
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      loginMutation.reset(); // Reset previous mutation state
      loginMutation.mutate(values);
    },
  });

  // Add Google Sign in handler
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
          provider: 'google',
          isLogin: true  // Add this flag to indicate it's a login attempt
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.status === "success") {
        if (!response.data.isExistingUser) {
          // User not registered
          toast.error("Account not found. Please register first.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate("/register");  // Redirect to registration page
          return;
        }

        // Existing user - proceed with login
        await loginUser({
          token: response.data.token,
          user: response.data.user
        });
        
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Login failed. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    
    const initializeGoogleSignIn = () => {
      const buttonContainer = document.getElementById('google-signin-button');
      
      if (window.google?.accounts?.id && buttonContainer) {
        console.log("Initializing Google Sign-in in Login");
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleGoogleSuccess,
            ux_mode: 'popup',
            context: 'signin',
            auto_select: false,
            itp_support: true
          });

          window.google.accounts.id.renderButton(
            buttonContainer,
            {
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              width: 400,
              shape: 'rectangular'
            }
          );
          
          console.log("Google Sign-in initialized successfully in Login");
        } catch (error) {
          console.error("Error initializing Google Sign-in:", error);
        }
      } else {
        retryCount++;
        console.log(`Google library or button container not yet available, retry ${retryCount} of ${maxRetries}`);
        console.log("Google library exists:", !!window.google?.accounts?.id);
        console.log("Button container exists:", !!buttonContainer);
        
        if (retryCount < maxRetries) {
          setTimeout(initializeGoogleSignIn, 1000);
        } else {
          console.error("Failed to initialize Google Sign-in after maximum retries");
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
          Login to Your Account
        </h2>
        
        {/* Google Sign-in Button */}
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

        <div className="mt-8 space-y-6">
          {loginMutation.isLoading && (
            <StatusMessage type="loading" message="Logging in..." />
          )}
          {loginMutation.isError && !loginMutation.isSuccess && (
            <StatusMessage
              type="error"
              message={loginMutation.error?.response?.data?.message || "Login Failed"}
            />
          )}
          {loginMutation.isSuccess && (
            <StatusMessage type="success" message="Login successful" />
          )}

          <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              ) : null}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;