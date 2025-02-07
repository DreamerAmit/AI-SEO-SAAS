import HomeFeatures from "./HomeFeatures";
import FreeTrial from "./FreeTrial";
import ai from "../../assets/ai.png";
import { Link } from "react-router-dom";
export default function Home() {
  return (
    <>
      <div className="bg-gray-900">
        <div className="relative isolate overflow-hidden pt-14">
          <img
            src={ai}
            alt="AI background"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 -z-10 bg-black bg-opacity-90"></div>

          {/* Hero Section */}
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-8">
                Transform Multiple Images to Text{' '}
                <span className="text-indigo-500">in Minutes</span>
              </h1>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="text-indigo-400 text-4xl mb-4">🖼️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Alt Text Generation</h3>
                  <p className="text-gray-300">
                    Generate SEO-friendly alt text for multiple images instantly
                  </p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="text-indigo-400 text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Instagram Captions</h3>
                  <p className="text-gray-300">
                    Create engaging Instagram captions from your images in bulk
                  </p>
                </div>
                
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <div className="text-indigo-400 text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-white mb-2">LinkedIn Posts</h3>
                  <p className="text-gray-300">
                    Convert images to professional LinkedIn post content
                  </p>
                </div>
              </div>

              {/* Value Proposition */}
              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
                Process up to 50 images simultaneously. Save hours of manual work with our 
                AI-powered image analysis. Perfect for social media managers, content creators, 
                and web developers.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col items-center justify-center gap-y-4">
                {/* Promotional text with smaller font size */}
                <p className="text-sm text-gray-300 font-medium tracking-wide">
                  Get 5 free image credits • No credit card required
                </p>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/5 py-12 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-300">Processing Speed</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                    50+ Images/Minute
                  </dd>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-300">Accuracy Rate</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                    99%
                  </dd>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-gray-300">Time Saved</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                    5hrs/Week
                  </dd>
                </div>
              </dl>
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
