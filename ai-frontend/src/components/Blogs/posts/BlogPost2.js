import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserIcon } from "@heroicons/react/20/solid";

export default function BlogPost2() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero section */}
      <div className="relative py-14 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-1">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Bulk Instagram Caption Generation: How AI Solves the Content Creator's Biggest Time Sink
            </h1>
            <div className="flex items-center gap-x-4 text-gray-300 border-l-4 border-indigo-500 pl-4">
              <UserIcon className="h-5 w-5" />
              <span>Vinaya Mahajan</span>
              <CalendarIcon className="h-5 w-5 ml-2" />
              <span>March 31, 2025</span>
              <span className="px-2 py-1 bg-indigo-500/10 rounded-full text-indigo-400 text-sm">
                2 min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-4xl mx-auto px-6 py-1">
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-gray-300 text-xl leading-relaxed mb-8">
          Content creators, social media managers, and marketing teams all face the same daunting challenge: the never-ending demand for fresh, engaging Instagram captions. With studies showing that the average professional spends 15-20 minutes crafting a single effective caption, this task quickly becomes one of the biggest time sinks in any content strategy. Our AI-powered Bulk Instagram Caption Generator addresses this critical pain point by allowing you to upload multiple images at once and receive custom-tailored captions for each, transforming hours of work into minutes.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
              The Hidden Cost of Caption Creation
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
              <li>Average time per caption: 15-20 minutes</li>
              <li>Recommended Instagram posting frequency: 3-7 posts per week</li>
              <li>Monthly time investment: 3-10 hours</li>
              <li>Delays content publication schedules</li>
              <li>Creates inconsistent posting frequency</li>
              <li>Leads to rushed, suboptimal Instagram captions</li>
              <li>Causes creative burnout among team members</li>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
              The Batch Processing Solution
              </h2>
              <ul className="list-disc pl-6 text-gray-300 space-y-4">
              <li>Simultaneous uploads: Rather than processing images one-by-one, upload your entire week's or month's Instagram content at once</li>
              <li>Visual analysis: Our advanced vision AI analyzes the content, context, and mood of each unique image</li>
              <li>Custom caption creation: Receive tailored captions specific to each image's content</li>
              <li>Brand voice consistency: All captions maintain your established tone and style</li>
              <li>Batch editing interface: Review and refine all captions in a single dashboard before implementation</li>
              </ul>
            </section>

          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Instagram Captions?
            </h3>
            <p className="text-gray-300 mb-6">
              Sign up today and experience the power of AI-driven Instagram caption generation.
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try It Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}