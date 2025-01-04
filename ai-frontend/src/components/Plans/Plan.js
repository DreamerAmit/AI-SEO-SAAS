import { CheckIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../AuthContext/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const tiers = [
  {
    name: "Starter",
    id: "Starter",
    href: "checkout",
    monthlyPrice: "$5/month",
    yearlyPrice: "$49/year",
    monthlyAmount: 5,
    yearlyAmount: 49,
    monthlyCredits: "100 Credits per month",
    yearlyCredits: "1,200 Credits per year",
    mostPopular: false,
  },

  {
    name: "Growth",
    id: "Growth",
    href: "checkout",
    monthlyPrice: "$19/month",
    yearlyPrice: "$189/year",
    monthlyAmount: 19,
    yearlyAmount: 189,
    monthlyCredits: "500 Credits per month",
    yearlyCredits: "6,000 Credits per year",
    mostPopular: true,
  },
  {
    name: "Pro",
    id: "Pro",
    href: "checkout",
    monthlyPrice: "$49/month",
    yearlyPrice: "$489/year",
    monthlyAmount: 49,
    yearlyAmount: 489,
    monthlyCredits: "2,000 Credits per month",
    yearlyCredits: "24,000 Credits per year",
    mostPopular: false,
  },
  {
    name: "Advanced",
    id: "Advanced",
    href: "checkout",
    monthlyPrice: "$119/month",
    yearlyPrice: "$1,179/year",
    monthlyAmount: 119,
    yearlyAmount: 1179,
    monthlyCredits: "5,000 Credits per month",
    yearlyCredits: "60,000 Credits per year",
    mostPopular: false,
  },
  {
    name: "Premium",
    id: "Premium",
    href: "checkout",
    monthlyPrice: "$229/month",
    yearlyPrice: "$2,199/year",
    monthlyAmount: 229,
    yearlyAmount: 2199,
    monthlyCredits: "10,000 Credits per month",
    yearlyCredits: "120,000 Credits per year",
    mostPopular: false,
  },
  {
    name: "Credit Packs",
    id: "Credit Packs",
    href: "checkout",
    price: "$3/pack",
    amount: 3 ,
    // description: "Dedicated support and infrastructure for your company.",
    features: [
      "50 Credits"
    ],
    mostPopular: false,
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const { isAuthenticated } = useAuth();

  // Separate subscription plans from credit packs
  const subscriptionPlans = tiers.filter(tier => tier.id !== "Credit Packs");
  const creditPacks = tiers.filter(tier => tier.id === "Credit Packs");

  const handleSlect = async (plan) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // If not authenticated, redirect to login
        navigate('/login');
        return;
      }

      // Get user data for authenticated users
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('token');
      console.log("Token Generated",token);
      const quantity = document.querySelector('input[type="number"]').value || 1;
      const { firstName, lastName, email } = userData;

      // Encode the values for URL
      const encodedFirstName = encodeURIComponent(firstName || '');
      const encodedLastName = encodeURIComponent(lastName || '');
      const encodedEmail = encodeURIComponent(email || '');

      setSelectedPlan(plan);
      
      if (plan?.id === "Free") {
        navigate("/free-plan");
        return;
      }

      // Get product ID based on plan and billing period
      let productId;
      switch (plan?.id) {
        case "Starter-monthly":
          productId = process.env.REACT_APP_STARTER_MONTHLY_ID;
          break;
        case "Starter-yearly":
          productId = process.env.REACT_APP_STARTER_YEARLY_ID;
          break;
        case "Growth-monthly":
          productId = process.env.REACT_APP_GROWTH_MONTHLY_ID;
          break;
        case "Growth-yearly":
          productId = process.env.REACT_APP_GROWTH_YEARLY_ID;
          break;
        case "Pro-monthly":
          productId = process.env.REACT_APP_PRO_MONTHLY_ID;
          break;
        case "Pro-yearly":
          productId = process.env.REACT_APP_PRO_YEARLY_ID;
          break;
        case "Advanced-monthly":
          productId = process.env.REACT_APP_ADVANCED_MONTHLY_ID;
          break;
        case "Advanced-yearly":
          productId = process.env.REACT_APP_ADVANCED_YEARLY_ID;
          break;
        case "Premium-monthly":
          productId = process.env.REACT_APP_PREMIUM_MONTHLY_ID;
          break;
        case "Premium-yearly":
          productId = process.env.REACT_APP_PREMIUM_YEARLY_ID;
          break;
        case "Credit Packs":
          productId = process.env.REACT_APP_CREDIT_PACK_ID;
          break;
        default:
          console.error('Invalid plan selected');
          return;
      }

      // Create checkout session
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/payments/create-checkout-session`, {
        productId,
        userId: userData.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Redirect to payment URL
      window.location.href = `${process.env.REACT_APP_DODO_CHECKOUT_URL}/${productId}?quantity=${quantity}&firstName=${encodedFirstName}&lastName=${encodedLastName}&email=${encodedEmail}&disableFirstName=true&disableLastName=true&disableEmail=true&redirect_url=${process.env.REACT_APP_REDIRECT_URL}`;

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate checkout');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="bg-gray-900 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center pt-4">
            <p className="text-3xl font-bold tracking-tight text-white sm:text-3xl">
              Pricing Plans
            </p>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-8 text-gray-300">
            1 credit = 1 image to text generation
            <br />
            Your first 5 credits are FREE. Purchase a plan or credit pack for additional credits.
          </p>

          {/* Subscription Plans Section */}
          <div className="mt-14">
            <div className="flex items-center justify-center gap-x-4 mb-4">
              {/* <span className="text-2xl font-bold text-white">Subscription Plans</span> */}
              <div className="relative flex items-center bg-gray-800 p-1 rounded-full">
                <button
                  className={`${
                    billingPeriod === 'monthly'
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  } relative rounded-full py-1 px-4 text-sm font-semibold transition-all duration-200`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`${
                    billingPeriod === 'yearly'
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  } relative rounded-full py-1 px-4 text-sm font-semibold transition-all duration-200`}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="isolate mx-auto mt-6 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              {subscriptionPlans.map((tier) => (
                <div
                  key={tier.id}
                  className={classNames(
                    tier.mostPopular
                      ? "bg-white/5 ring-2 ring-indigo-500"
                      : "ring-1 ring-white/10",
                    "rounded-3xl p-6 xl:p-8"
                  )}
                  onClick={() => handleSlect({
                    ...tier,
                    amount: billingPeriod === 'yearly' ? tier.yearlyAmount : tier.monthlyAmount,
                    id: `${tier.id}-${billingPeriod}`
                  })}
                >
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={tier.id}
                      className="text-lg font-semibold leading-8 text-white"
                    >
                      {tier.name}
                    </h3>
                    {tier.mostPopular ? (
                      <p className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                        Most popular
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-col gap-1">
                    <span className="text-2xl font-bold tracking-tight text-white">
                      {billingPeriod === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-sm text-gray-300">
                      {billingPeriod === 'yearly' ? '' : ''}
                    </span>
                  </div>
                  <a
                    aria-describedby={tier.id}
                    className="mt-4 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 
                      bg-indigo-500 text-white cursor-pointer shadow-sm hover:bg-indigo-400 
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 
                      focus-visible:outline-indigo-500"
                  >
                    Buy plan
                  </a>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10"
                  >
                    <li key={billingPeriod === 'yearly' ? tier.yearlyCredits : tier.monthlyCredits} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-white"
                        aria-hidden="true"
                      />
                      {billingPeriod === 'yearly' ? tier.yearlyCredits : tier.monthlyCredits}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Packs Section */}
          <div className="mt-16 pb-12">
            <div className="mx-auto max-w-4xl bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                  <h2 className="text-2xl font-semibold text-white">Credit Packs</h2>
                  <span className="text-gray-300">{creditPacks[0].features[0]}</span>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <span className="text-3xl font-bold text-white flex items-center">
                    ${creditPacks[0].amount}
                    <span className="text-gray-300 text-base font-normal ml-1">/pack</span>
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="block w-20 rounded-md border-0 bg-white/10 px-3 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    <button
                      onClick={() => handleSlect(creditPacks[0])}
                      className="rounded-md bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      Buy Credits
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
