import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserIcon } from "@heroicons/react/20/solid";

export default function BlogPost3() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero section */}
      <div className="relative py-14 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-1">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Add Captions at the bottom of your images: The Instagram Hack That Increases Engagement
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
          In today's visually-driven social media landscape, the battle for attention is fiercer than ever. While stunning photography remains important, our analysis across platforms reveals a game-changing insight: images with integrated text receive higher visibility than those without. Our AI-powered Text-On-Image Generator solves the critical problem of message visibility by automatically creating professionally designed photo captions that are embedded directly into your images.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
              The Invisible Message Problem
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
              <li>Platform limitations: Most platforms hide, truncate, or de-emphasize text descriptions</li>
              <li>Sharing dilution: When content is reshared, original message context is frequently lost</li>
              <li>Cross-platform inconsistency: Caption display varies dramatically between platforms</li>
              <li>Manual text overlay: Using photo editing software is time-consuming and requires design skills</li>
              <li>Text-only graphics: Create separate text slides that interrupt visual flow</li>
              <li>Platform-specific formatting: Creating different versions for each platform, multiplying workload</li>
              <li>Limited message scope: Reducing message complexity to fit platform constraints</li>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
              The Integrated Text-On-Image Solution
              </h2>
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <ul className="text-gray-300 space-y-3">
              <li>Upload any photo: Start with your existing image</li>
              <li>AI message generation: Our system analyzes your image and suggests contextually appropriate text</li>
              <li>Professional design integration: Text is artfully placed using advanced graphic design principles</li>
              <li>Optimal readability: Automatic background effects ensure text clarity regardless of image complexity</li>
              <li>Cross-platform ready: One image works perfectly across Instagram, Facebook, Twitter, Pinterest and more</li>
                </ul>
              </div>
            </section>

            </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
            Ready to add captions to your images?
            </h3>
            <p className="text-gray-300 mb-6">
            Try our photo caption tool today and discover why leading brands are incorporating text into their visual content strategy for dramatically improved communication effectiveness.
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
