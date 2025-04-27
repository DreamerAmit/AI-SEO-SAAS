import HomeFeatures from "./HomeFeatures";
import FreeTrial from "./FreeTrial";
import ai from "../../assets/ai.png";
import { Link } from "react-router-dom";
import { FaEdit, FaInstagram, FaVideo, FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <div className="bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="relative isolate overflow-hidden pt-14">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_25%_at_50%_50%,#1e293b_0%,rgba(15,23,42,0)_100%)] opacity-50"></div>
          
          {/* Subtle pattern */}
          <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-slate-900 bg-gradient-to-tr from-slate-800 opacity-10 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"></div>
          
          {/* Hero Section */}
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-32">
            <div className="text-center mb-12">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-slate-200 mb-5">
                Powered by OpenAI Image Generation
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6 leading-tight">
                <span className="block">Turn Images into</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-slate-300">Viral Content</span>
              </h1>
              <p className="max-w-xl mx-auto text-xl text-slate-300 mt-5">
                AI-powered image editing, reel and caption generation for content creators and marketers
              </p>
            </div>
            
            {/* Feature Cards - Classic Version */}
            <div className="relative">
              {/* Subtle decorative elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-900 rounded-full blur-[120px] opacity-10"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16 relative z-10">
                <div className="group bg-slate-800/80 p-8 rounded-xl backdrop-blur-xl border border-slate-700 shadow-lg hover:shadow-black/5 transition duration-300 hover:-translate-y-1">
                  <div className="bg-blue-700 rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300">
                    <FaEdit className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Image Editing</h3>
                  <p className="text-slate-300 mb-4">
                    Transform your images with text prompts using cutting-edge AI technology
                  </p>
                  <Link to="/caption-generator" className="inline-flex items-center text-blue-300 hover:text-blue-200 transition">
                    Try now <FaArrowRight className="ml-2 text-sm" />
                  </Link>
                </div>
                
                <div className="group bg-slate-800/80 p-8 rounded-xl backdrop-blur-xl border border-slate-700 shadow-lg hover:shadow-black/5 transition duration-300 hover:-translate-y-1">
                  <div className="bg-blue-700 rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300">
                    <FaInstagram className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Instagram Captions</h3>
                  <p className="text-slate-300 mb-4">
                    Generate engaging, viral-worthy captions for your social media posts
                  </p>
                  <Link to="/caption-generator" className="inline-flex items-center text-blue-300 hover:text-blue-200 transition">
                    Try now <FaArrowRight className="ml-2 text-sm" />
                  </Link>
                </div>
                
                <div className="group bg-slate-800/80 p-8 rounded-xl backdrop-blur-xl border border-slate-700 shadow-lg hover:shadow-black/5 transition duration-300 hover:-translate-y-1">
                  <div className="bg-blue-700 rounded-xl w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition duration-300">
                    <FaVideo className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Reel Generator</h3>
                  <p className="text-slate-300 mb-4">
                    Create professional video reels from your images with just a few clicks
                  </p>
                  <Link to="/reel-generator" className="inline-flex items-center text-blue-300 hover:text-blue-200 transition">
                    Try now <FaArrowRight className="ml-2 text-sm" />
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Professional Version */}
            <div className="relative z-10 mt-5 mb-10">
              <div className="flex flex-col items-center space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-slate-800 rounded-full">
                  <span className="flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <p className="text-sm text-slate-300 font-medium">
                    <span className="font-bold text-white">25 free</span> image credits • No credit card required
                  </p>
                </div>
                
                <Link
                  to="/register"
                  className="relative inline-flex group items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-700 rounded-lg overflow-hidden shadow-lg hover:bg-blue-600 transition duration-300"
                >
                  <span className="relative z-10">Start Free Trial</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keep your existing components */}
      <HomeFeatures />
      <FreeTrial />
    </>
  );
}
