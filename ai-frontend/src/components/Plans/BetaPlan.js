import { useState } from 'react';

export default function BetaMessage() {
  const [formData, setFormData] = useState({
    email: '',
    question: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add logic to send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
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
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-xl">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-2 block w-full rounded-md border-gray-300 bg-white/5 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-white">
                  Your Question
                </label>
                <textarea
                  id="question"
                  required
                  rows={4}
                  className="mt-2 block w-full rounded-md border-gray-300 bg-white/5 py-2 px-3 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full rounded-md bg-indigo-500 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Question
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-12 text-center">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Thanks for reaching out! We'll get back to you soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
