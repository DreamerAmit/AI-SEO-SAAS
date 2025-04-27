import React from "react";
import beforeImage from "../../assets/before-testimonial.webp";
import afterImage from "../../assets/after-testimonial.png";
import { FaUpload, FaKeyboard, FaDownload, FaMagic } from "react-icons/fa";

export default function HomeFeatures() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-900 rounded-full blur-[150px] opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-slate-700 rounded-full blur-[150px] opacity-10"></div>
      
      {/* Section header */}
      <div className="container mx-auto px-4 mb-16">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="px-3 py-1 text-sm font-medium bg-slate-800 text-slate-300 rounded-full mb-3">
            AI-Powered Transformation
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">Magic</span> in Action
          </h2>
          <div className="w-24 h-1 bg-blue-700 rounded-full mb-6"></div>
          <p className="max-w-2xl text-lg text-slate-300">
            Transform ordinary product images into compelling content with AI-generated customer testimonials
          </p>
        </div>
      </div>

      {/* Before and After Comparison - Professional Version */}
      <div className="container mx-auto px-4 mb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16">
            {/* Before Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl blur opacity-20"></div>
              <div className="relative bg-slate-800 rounded-xl p-2 shadow-xl">
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-4 py-1 rounded-md text-sm font-semibold z-10">
                  Before
                </div>
                <img 
                  src={beforeImage} 
                  alt="Original product image" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
            
            {/* Arrow/transition between images */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative bg-slate-800/70 backdrop-blur-sm p-3 rounded-full">
                <FaMagic className="text-blue-400 text-3xl animate-pulse" />
              </div>
            </div>
            
            {/* After Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-blue-800 rounded-xl blur opacity-20"></div>
              <div className="relative bg-slate-800 rounded-xl p-2 shadow-xl">
                <div className="absolute top-4 left-4 bg-blue-700/80 backdrop-blur-sm text-white px-4 py-1 rounded-md text-sm font-semibold z-10">
                  After
                </div>
                <img 
                  src={afterImage} 
                  alt="Image with customer testimonial added by AI" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section - Professional Version */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/60 p-8 md:p-12 rounded-xl backdrop-blur-sm border border-slate-700 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-lg p-0.5">
                  <div className="bg-slate-900 rounded-lg p-8 h-full">
                    <div className="bg-blue-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                      <FaUpload className="text-blue-400 text-2xl" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Upload Your Image</h4>
                    <p className="text-slate-300">
                      Securely upload the product or brand image you want to enhance with AI
                    </p>
                  </div>
                </div>
                {/* Connector line to next step (only on desktop) */}
                <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-lg p-0.5">
                  <div className="bg-slate-900 rounded-lg p-8 h-full">
                    <div className="bg-blue-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                      <FaKeyboard className="text-blue-400 text-2xl" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Enter Your Prompt</h4>
                    <p className="text-slate-300">
                      Describe what you want to add or modify with natural language instructions
                    </p>
                  </div>
                </div>
                {/* Connector line to next step (only on desktop) */}
                <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-700 to-blue-600 rounded-lg p-0.5">
                  <div className="bg-slate-900 rounded-lg p-8 h-full">
                    <div className="bg-blue-900/30 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                      <FaDownload className="text-blue-400 text-2xl" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4">Get Results</h4>
                    <p className="text-slate-300">
                      Download your enhanced image with AI-generated customer testimonials
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
