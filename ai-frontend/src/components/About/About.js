import React from "react";
import {
  LifebuoyIcon,
  NewspaperIcon,
  PhoneIcon,
} from "@heroicons/react/20/solid";

const cards = [
  {
    name: "AI Powered Speed",
    description:
      "We believe that AI models are now efficient enough to understand the image and generate a good AltText for it.It has the potential to save a lot of time while adding AltText for modern websites.",
    icon: PhoneIcon,
  },
  {
    name: "SEO Friendly",
    description:
      "When you use Pic2Alt, you can be sure that the AltText generated is SEO friendly and can help your website rank better in search engines.",
    icon: LifebuoyIcon,
  },
  {
    name: "Quick Support",
    description:
      "We have a very quick support team to help you with any queries you may have while using Pic2Alt.",
    icon: NewspaperIcon,
  },
];

export default function AboutUs() {
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      {/* Background and layout elements */}
      {/* ... */}

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Pic2Alt - Quick AltText Generation using AI
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
          Pic2Alt was built to help customers solve a very specific problem ie to generate AltText for multiple images within a fraction of time and that too automatically, eliminating the need of manual copywriter to see the image, think and then write an AltText that may be SEO friendly.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {cards.map((card) => (
            <div
              key={card.name}
              className="flex gap-x-4 rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-white/10"
            >
              <card.icon
                className="h-7 w-5 flex-none text-indigo-400"
                aria-hidden="true"
              />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-white">{card.name}</h3>
                <p className="mt-2 text-gray-300">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
