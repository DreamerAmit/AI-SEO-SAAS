import React from "react";
import ai1 from "../../assets/robot-with-wrench.png";
import blink from "../../assets/blink-sm.png";

export default function HomeFeatures() {
  return (
    <section className="relative py-12 md:py-24 lg:py-32 bg-gray-900 bg-body overflow-hidden">
      <h2 className="text-4xl font-bold text-white text-center mb-20 -mt-20 ml-1">
        Two Powerful Ways to Generate Alt Text
      </h2>

      {/* Method 1: Website Scraping */}
      <div className="relative container mx-auto px-4 mb-20">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-2/5 xl:w-1/2 px-4 mb-8 lg:mb-0">
            <img
              className="block w-full max-w-md xl:max-w-lg"
              src={ai1}
              alt="Features bg"
            />
          </div>
          <div className="w-full lg:w-3/5 xl:w-1/2 px-4">
            <div className="relative overflow-hidden">
              <h3 className="text-2xl font-bold text-indigo-500 mb-6">Method 1: Website Scraping</h3>
              <div className="slider">
                <div className="slider-container">
                  <div className="slide flex mb-16 items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-indigo-700">
                      <span className="text-2xl text-white">1</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        Enter Website URL
                      </h4>
                      <p className="text-xl text-gray-400">
                        Simply paste your website URL and let our AI find all images automatically
                      </p>
                    </div>
                  </div>
                  <div className="slide flex mb-16 items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-indigo-700">
                      <span className="text-2xl text-white">2</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        AI Scans Your Website
                      </h4>
                      <p className="text-xl text-gray-400">
                        Our AI quickly scans and identifies all images on your webpage
                      </p>
                    </div>
                  </div>
                  <div className="slide flex items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-indigo-700">
                      <span className="text-2xl text-white">3</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        Get Alt Text Instantly
                      </h4>
                      <p className="text-xl text-gray-400">
                        Receive SEO-optimized alt text for all your website images at once
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Method 2: Bulk Upload */}
      <div className="relative container mx-auto px-4">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-3/5 xl:w-1/2 px-4 order-2 lg:order-1">
            <div className="relative overflow-hidden">
              <h3 className="text-2xl font-bold text-indigo-500 mb-6">Method 2: Bulk Image Upload</h3>
              <div className="slider">
                <div className="slider-container">
                  <div className="slide flex mb-16 items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-yellow-600">
                      <span className="text-2xl text-white">1</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        Upload Multiple Images
                      </h4>
                      <p className="text-xl text-gray-400">
                        Upload up to 50 images at once - drag & drop or select files
                      </p>
                    </div>
                  </div>
                  <div className="slide flex mb-16 items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-yellow-600">
                      <span className="text-2xl text-white">2</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        Customize AI Processing
                      </h4>
                      <p className="text-xl text-gray-400">
                        Add custom prompts for Instagram captions, LinkedIn posts, or alt text
                      </p>
                    </div>
                  </div>
                  <div className="slide flex items-start">
                    <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-yellow-600">
                      <span className="text-2xl text-white">3</span>
                    </div>
                    <div className="max-w-lg">
                      <h4 className="text-3xl font-medium text-white mb-8">
                        Download or Copy Results
                      </h4>
                      <p className="text-xl text-gray-400">
                        Get your AI-generated text for all images in minutes - ready to use
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/5 xl:w-1/2 px-4 mb-8 lg:mb-0 order-1 lg:order-2">
            <img
              className="block w-full max-w-md xl:max-w-lg ml-auto"
              src={ai1}
              alt="Features bg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
