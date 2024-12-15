import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserProfileAPI } from "../../apis/user/usersAPI";
import StatusMessage from "../Alert/StatusMessage";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { useEffect } from 'react';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  //get the user profile
  const { isLoading, isError, data, error } = useQuery({
    queryFn: getUserProfileAPI,
    queryKey: ["profile"],
    onError: (error) => {
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  });

  console.log("Dashboard query state:", { isLoading, isError, data, error });

  //dsiplay loading
  if (isLoading) {
    return <StatusMessage type="loading" message="Loading please wait..." />;
  }

  //check for error
  if (isError) {
    console.error("Dashboard error:", error);
    return (
      <StatusMessage 
        type="error" 
        message={error?.message || "An unknown error occurred"} 
      />
    );
  } else {
    return (
      <div className="p-4 bg-gray-900 min-h-screen overflow-x-hidden">
        <h1 className="text-3xl font-bold text-center mb-8 text-green-600">
          Welcome, {data?.user?.firstName || data?.user?.username || 'User'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 max-w-full">
          {/* Profile Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Name
                </label>
                <p
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  id="username"
                >
               {`${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`.trim()}
                </p>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <p
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  id="email"
                >
                  {data?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Credit Usage Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Credit Usage</h2>
            <div>
              {/* <p className="mb-4">
                Monthly Credit: {data?.user?.monthlyRequestCount}
              </p> 
              <p className="mb-4">Credit Used: {data?.user?.apiRequestCount}</p>*/}
              <p className="mb-4">
                Credit Remaining:{" "}
                {data?.user?.image_credits}
              </p>
              {/* <p className="mb-4">
                Next Billing Date:{" "}
                {data?.user?.nextBillingDate
                  ? data?.user?.nextBillingDate
                  : "No Billing date"}
              </p> */}
            </div>
          </div>

          {/* Payment and Plans Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Payment & Plans</h2>
            <div>
              <p className="mb-4">
                Current Plan: {data?.user?.subscriptionPlan}
              </p>
              <p className="mb-4">
                Billing Cycle: Monthly
              </p>
              <p className="mb-4">
                Next Renewal Date: 1st Jan 2025
              </p>

              {data?.user?.subscriptionPlan === "Free" && (
                <p className="border mb-2 rounded w-full py-2 px-3 text-gray-700 leading-tight">
                  Free: 5 monthly request
                </p>
              )}
              {data?.user?.subscriptionPlan === "Basic" && (
                <p className="border mb-2 rounded w-full py-2 px-3 text-gray-700 leading-tight">
                  Basic: 50 monthly request
                </p>
              )}
              {data?.user?.subscriptionPlan === "Premium" && (
                <p className="border mb-2 rounded w-full py-2 px-3 text-gray-700 leading-tight">
                  Premium: 100 monthly request
                </p>
              )}
              <div className="flex gap-4">
                <Link
                  to="/plans"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upgrade Plan
                </Link>
                <button
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>

          {/* Trial Information Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Images with AltText in your Library</h2>
            <div>
              <p className="mb-4">
                Count: {data?.user?.imagecount}
              </p>
              <div className="mt-24"></div>
              <div className="flex gap-4">
                <Link
                  to="/images"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Payment History
            </h2>
            <ul className="divide-y divide-gray-200">
              {/* Example 1: Recent Premium Plan Payment */}
              <li className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-indigo-600">
                      Premium Plan Subscription
                    </p>
                    <p className="text-xs text-gray-500">
                      March 15, 2024
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Transaction ID: TXN_PM_789012345
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Credits Added: 100
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-semibold text-green-500">
                        succeeded
                      </p>
                      <p className="text-sm text-gray-700">
                        $ 49.99
                      </p>
                    </div>
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      title="Download Invoice"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="ml-1">Invoice</span>
                    </button>
                  </div>
                </div>
              </li>

              {/* Example 2: Basic Plan Payment */}
              <li className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-indigo-600">
                      Basic Plan Subscription
                    </p>
                    <p className="text-xs text-gray-500">
                      February 15, 2024
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Transaction ID: TXN_BS_456789012
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Credits Added: 50
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-semibold text-green-500">
                        succeeded
                      </p>
                      <p className="text-sm text-gray-700">
                        $ 29.99
                      </p>
                    </div>
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      title="Download Invoice"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="ml-1">Invoice</span>
                    </button>
                  </div>
                </div>
              </li>

              {/* Example 3: Failed Payment */}
              <li className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-indigo-600">
                      Premium Plan Subscription
                    </p>
                    <p className="text-xs text-gray-500">
                      January 15, 2024
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Transaction ID: TXN_FL_123456789
                    </p>
                    <p className="text-xs text-red-500 font-medium mt-1">
                      Credits Added: 0
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-semibold text-red-500">
                        failed
                      </p>
                      <p className="text-sm text-gray-700">
                        $ 49.99
                      </p>
                    </div>
                    <button
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      title="Download Invoice"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <span className="ml-1">Invoice</span>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
