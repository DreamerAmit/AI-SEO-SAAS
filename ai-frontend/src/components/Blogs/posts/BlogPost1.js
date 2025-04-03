import React from 'react';
import { CalendarIcon, UserIcon } from "@heroicons/react/20/solid";
import { Link } from 'react-router-dom';

export default function BlogPost1() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero section with gradient background */}
      <div className="relative py-8 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Article header */}
          <div className="mb-1">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Automated Alt Text Generation: Making Your Website More Accessible In Minutes
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
      <div className="max-w-4xl mx-auto px-6 py-2">
        <div className="prose prose-lg prose-invert max-w-none">
          {/* Introduction */}
          <p className="text-gray-300 text-xl leading-relaxed mb-8">
          In today's digital landscape, website accessibility isn't just a nice-to-have—it's essential for ADA compliance, digital inclusivity, and even search engine optimization. Yet for many website owners, one critical aspect of accessibility remains perpetually overlooked: proper alt text for images. Our AI-powered Alt Text Generator solves this widespread problem by automatically scanning your website and generating descriptive, contextual image descriptions for every image 
          </p>

          {/* Main content sections */}
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
              The Hidden Crisis of Missing Alt Text
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
              <li>Accessibility barriers: Visitors using screen readers cannot understand what's in your images</li>
              <li>SEO penalties: Search engines value proper image descriptions and may rank your site lower without them</li>
              <li>Legal vulnerability: Many regions now have digital accessibility laws that require alt text for WCAG compliance</li>
              <li>User experience failures: When images fail to load, missing alt text leaves users with no context</li>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">
                Key Benefits and Applications
              </h2>
              <ul className="list-disc pl-6 text-gray-300 space-y-4">
                <li>Improved SEO performance: Proper alt text helps search engines understand your images, potentially improving search rankings</li>
                <li>Enhanced user experience: All visitors benefit from properly labeled images, especially in cases where images fail to load</li>
                <li>Time and resource savings: Your team can focus on creating content rather than writing descriptions</li>
                <li>Future-proofing: As you add new content, the tool can automatically generate alt text, eliminating ongoing maintenance costs</li>
              </ul>
            </section>

          </div>

          {/* Call to action section */}
          <div className="mt-12 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6">
              Generate AltText for your images in minutes by just scanning your website. Explore our AI-powered solution by signing up today.
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
