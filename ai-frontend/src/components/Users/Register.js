import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerAPI } from "../../apis/user/usersAPI";
import StatusMessage from "../Alert/StatusMessage";
import { useAuth } from "../../AuthContext/AuthContext";

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
  //custom auth hook
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  //Redirect if a user is login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  //mutation
  const mutation = useMutation({
    mutationFn: registerAPI,
    onSuccess: (data) => {
      console.log("Registration response:", data);
      if (data.status === "success") {
        console.log("Registration successful", data);
        // Show success message to user
        // You might want to automatically log the user in here
        // Or redirect them to the login page
        navigate("/login");
      } else {
        console.error("Registration failed", data);
        // Show error message to user
      }
    },
    onError: (error) => {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-20">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 m-4">
        {/* Google Sign-up button */}
        {/* <button
          onClick={handleGoogleSignIn}
          className="w-full mb-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-center">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </div>
        </button> */}

        {/* <div className="relative mb-4">
          <hr className="border-t border-gray-300" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-sm text-gray-500">
            OR
          </span>
        </div> */}

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create an Account
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Create an account to get 5 free images to AltText conversion. No credit card
          required.
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
            message={mutation.error?.response?.data?.message || "Registration failed"}
          />
        )}
        {/* display success */}
        {mutation.isSuccess && (
          <StatusMessage type="success" message="Registration successful" />
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
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
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
