import axios from "axios";
//=======Stripe Payment=====

export const handleFreeSubscriptionAPI = async () => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/stripe/free-plan`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Stripe  Payment intent=====

export const createStripePaymentIntentAPI = async (payment) => {
  console.log(payment);
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/stripe/checkout`,
    {
      amount: Number(payment?.amount),
      subscriptionPlan: payment?.plan,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Verify  Payment =====

export const verifyPaymentAPI = async (paymentId) => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_URL}/stripe/verify-payment/${paymentId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
