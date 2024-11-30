import { useNavigate } from 'react-router-dom';

export default function BetaMessage() {
  const navigate = useNavigate();

  const handleContactSupport = () => {
    navigate('/support');
  };

  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-3xl">
            Thanks for Your Interest in our Pricing Section!
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            We're currently in beta and integrating our payment gateway. Your first 5 credits are on us, signup for free trial if you haven't already!
            Have questions about our pricing? We'd love to hear from you.
          </p>

          <div className="mt-10">
            <button
              onClick={handleContactSupport}
              className="rounded-md bg-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
