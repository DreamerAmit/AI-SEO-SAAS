import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserProfileAPI, getSubscriptionDetailsAPI, getPaymentHistoryAPI, cancelSubscriptionAPI } from "../../apis/user/usersAPI";
import StatusMessage from "../Alert/StatusMessage";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  //get the user profile
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["profile"],
    queryFn: getUserProfileAPI,
    onError: (error) => {
      if (error.response && error.response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  });

  // Add new queries
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscriptionDetailsAPI,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const { data: paymentHistory } = useQuery({
    queryKey: ["paymentHistory", currentPage],
    queryFn: () => getPaymentHistoryAPI(currentPage),
  });

  // Add mutation for cancelling subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelSubscriptionAPI,
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries(["subscription"]);
      // Show success message
      toast.success("Subscription cancelled successfully");
    },
    onError: (error) => {
      console.error("Cancel subscription error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    }
  });

  const handleCancelRenewal = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription renewal?")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'NA';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

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
                  className="block text-gray-500 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Name
                </label>
                <p
                  className="border rounded w-full py-2 px-3 text-gray-500 leading-tight"
                  id="username"
                >
               {`${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`.trim()}
                </p>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-500 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <p
                  className="border rounded w-full py-2 px-3 text-gray-500 leading-tight"
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
              <span className="font-bold mb-2 text-sm text-gray-500">  Credit Remaining:{" "} </span>
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
                <span className="font-bold mb-2 text-sm text-gray-500">Current Plan:</span>{" "}
                {subscriptionData?.subscription?.current_plan || 'Trial'}
              </p>
              <p className="mb-4">
                <span className="font-bold mb-2 text-sm text-gray-500">Payment Status:</span>{" "}
                {subscriptionData?.subscription?.payment_status === 'Payment Successful' ? (
                  <span className="text-green-500 font-bold italic">Payment Successful</span>
                ) : (
                  subscriptionData?.subscription?.payment_status || 'Not Subscribed'
                )}
              </p>
              <p className="mb-4">
                <span className="font-bold mb-2 text-sm text-gray-500">Billing Cycle:</span>{" "}
                {subscriptionData?.subscription?.current_plan?.toLowerCase().includes('monthly') ? 'Monthly' : 
                 subscriptionData?.subscription?.current_plan?.toLowerCase().includes('yearly') ? 'Yearly' : 'NA'}
              </p>
              <p className="mb-4">
                <span className="font-bold mb-2 text-sm text-gray-500">Next Renewal Date:</span>{" "}
                {formatDate(subscriptionData?.subscription?.next_renewal_date)}
              </p>
              <div className="flex gap-4">
                <Link
                  to="/plans"
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Credits
                </Link>
                {subscriptionData?.subscription?.payment_status === 'Payment Successful' && (
                  <button 
                    onClick={handleCancelRenewal}
                    disabled={cancelSubscriptionMutation.isLoading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {cancelSubscriptionMutation.isLoading ? "Cancelling..." : "Cancel Renewal"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trial Information Section */}
          <div className="mb-6 bg-white p-4 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Images with AltText in your Library</h2>
            <div>
              <p className="mb-4">
                <span className="font-bold mb-2 text-sm text-gray-500">Count:</span> {data?.user?.imagecount}
              </p>
              <div className="mt-28"></div>
              <div className="mt-auto pt-6">
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
              {paymentHistory?.history?.map((transaction) => (
                <li key={transaction.transactionId} className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className={`text-sm font-medium ${
                        transaction.status === 'failed' 
                          ? 'text-red-600' 
                          : 'text-indigo-600'
                      }`}>
                        {transaction.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Transaction ID: {transaction.transactionId}
                      </p>
                      <p className={`text-xs ${
                        transaction.status === 'failed'
                          ? 'text-red-500'
                          : 'text-emerald-600'
                      } font-medium mt-1`}>
                        Credits Added: {transaction.creditsAdded}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {(!paymentHistory?.history || paymentHistory.history.length === 0) && (
                <li className="py-4 text-center text-gray-500">
                  No payment history available
                </li>
              )}
            </ul>
            
            {paymentHistory?.pagination?.totalPages > 1 && (
              <Pagination
                currentPage={paymentHistory.pagination.currentPage}
                totalPages={paymentHistory.pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Dashboard;
