import React from "react";
import { CalendarIcon, UserIcon, BookOpenIcon } from "@heroicons/react/20/solid";
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "Automated Alt Text Generation: Making Your Website More Accessible In Minutes",
    description: "In today's digital landscape, website accessibility isn't just a nice-to-have—it's essential for ADA compliance, digital inclusivity, and even search engine optimization.",
    author: "Vinaya Mahajan",
    date: "March 31, 2025",
    readTime: "2 min read",
    path: "/blog/post1"
  },
  {
    title: "Bulk Instagram Caption Generation: How AI Solves the Content Creator's Biggest Time Sink",
    description: "Content creators, social media managers, and marketing teams all face the same daunting challenge: the never-ending demand for fresh, engaging Instagram captions.",
    author: "Vinaya Mahajan",
    date: "March 31, 2025",
    readTime: "2 min read",
    path: "/blog/post2",
    icon: BookOpenIcon
  },
  {
    title: "Add Captions at the bottom of your images: The Instagram Hack That Increases Engagement",
    description: "Instagram captions are more than just a simple text overlay. They're a powerful tool for connecting with your audience and increasing engagement.",
    author: "Vinaya Mahajan",
    date: "March 31, 2025",
    readTime: "2 min read",
    path: "/blog/post3",
    icon: BookOpenIcon
  },
];

export default function Blogs() {
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Pic2Alt blogs
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Stay updated on how Pic2Alt.com is helping with AltText and captioning for images using AI.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.title}
              className="flex flex-col rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-x-3 text-sm text-gray-400 mb-4">
                <UserIcon className="h-5 w-5" />
                <span>{post.author}</span>
                <CalendarIcon className="h-5 w-5 ml-2" />
                <span>{post.date}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{post.title}</h3>
              <p className="text-gray-300 flex-grow">{post.description}</p>
              <div className="mt-4 flex items-center text-indigo-400">
                <Link 
                  to={post.path} 
                  className="mt-4 flex items-center text-indigo-400 hover:text-indigo-300"
                >
                  <span>{post.readTime}</span>
                  <span className="ml-2">• Read More →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
