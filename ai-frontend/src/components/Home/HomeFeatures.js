import React from "react";
import ai1 from "../../assets/robot-with-wrench.png";
import blink from "../../assets/blink-sm.png";

export default function HomeFeatures() {
  return (
    <>
      <section className="relative py-12 md:py-24 lg:py-32 bg-gray-900 bg-body overflow-hidden">
        {/*} <img
          className="hidden sm:block absolute top-0 right-1/2 -mr-64 xl:mr-24 mt-12 h-20 animate-spinStar"
          src={blink}
          alt="Blink"
        />
        <img
          className="hidden sm:block absolute bottom-0 right-0 mb-64 mr-8 h-20 animate-spinStar"
          src={blink}
          alt="Blink"
        />*/}
        <h2 className="text-4xl font-bold text-white text-center mb-20 -mt-20 ml-1">
          How it Works
        </h2>
        <div className="relative container mx-auto px-4">
        
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
      
                <div className="hidden xs:block absolute z-10 top-0 left-0 w-full h-20 lg:h-48 bg-gradient-to-b from-darkBlue-900 via-darkBlue-900 to-transparent opacity-90" />
                <div className="hidden xs:block absolute z-10 bottom-0 left-0 w-full h-20 lg:h-48 bg-gradient-to-t from-darkBlue-900 via-darkBlue-900 to-transparent opacity-90" />
                <div className="slider">
                  <div className="slider-container">
                    <div className="slide flex mb-16 items-start">
                      <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-indigo-700">
                        {/* Icon or image */}
                      </div>
                      <div className="max-w-lg">
                        <h4 className="text-3xl font-medium text-white mb-8">
                          1. Scrape website pages for images
                        </h4>
                        <p className="text-xl text-gray-400">
                          Scrape website pages for images and generate alt text for them.
                        </p>
                      </div>
                    </div>
                    <div className="slide flex mb-16 items-start">
                      <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-yellow-700">
                        {/* Icon or image */}
                      </div>
                      <div className="max-w-lg">
                        <h4 className="text-3xl font-medium text-white mb-8">
                          2. AI analyzes your Image
                        </h4>
                        <p className="text-xl text-gray-400">
                          AI analyzes your Image in no time and generates the best possible alt text.
                        </p>
                      </div>
                    </div>
                    <div className="slide flex items-start">
                      <div className="flex-shrink-0 flex mr-8 items-center justify-center w-16 h-16 rounded-full bg-green-700">
                        {/* Icon or image */}
                      </div>
                      <div className="max-w-lg">
                        <h4 className="text-3xl font-medium text-white mb-8">
                          3. Your Alt Text is ready!
                        </h4>
                        <p className="text-xl text-gray-400">
                          The Alt Text is ready to be used and you can either copy or download it. Apply Alt Text to Images and improve your site's SEO and accessibility.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
