import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";

const features = [
  {
    name: "Push to deploy",
    description:
      "Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu. Phasellus praesent ligula sit faucibus.",
    href: "#",
    icon: CloudArrowUpIcon,
  },
  {
    name: "SSL certificates",
    description:
      "Pellentesque enim a commodo malesuada turpis eleifend risus. Facilisis donec placerat sapien consequat tempor fermentum nibh.",
    href: "#",
    icon: LockClosedIcon,
  },
  {
    name: "Simple queues",
    description:
      "Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.",
    href: "#",
    icon: ArrowPathIcon,
  },
];

export default function AppFeatures() {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          {/* <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Deploy faster
          </h2> */}
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contact Us
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
          If you have any issues while using our app or a suggestion to make the app better, just fill the form below and we will get back to you at our earliest
          </p>
        </div>
         {/* Form Section */}
    <form className="mt-8 space-y-4">
        <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-white">First Name</label>
            <input type="text" id="firstName" name="firstName" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-white">Last Name</label>
            <input type="text" id="lastName" name="lastName" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input type="email" id="email" name="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
            <label htmlFor="message" className="block text-sm font-medium text-white">Message</label>
            <textarea id="message" name="message" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4"></textarea>
        </div>
        <div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-md hover:bg-indigo-700">Submit</button>
        </div>
    </form>
        {/* <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-indigo-400"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-indigo-400"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div> */}
{/* FAQ Section */}

{/* <div className="mt-10">
    <h2 className="text-2xl font-bold text-white text-center">Frequently Asked Questions</h2>
    <div className="mt-4 space-y-4">
        <div className="bg-gray-800 p-4 rounded-md">
            <h3 className="font-semibold text-white">Question 1: What kind of images are supported?</h3>
            <p className="text-gray-300">We can generate alt text for all popular image formats. We support JPG, PNG, GIF, WEBP, and BMP images, as long as they are less than 10MB in size and at least 50x50 pixels.</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md">
            <h3 className="font-semibold text-white">Question 2: How do credits and pricing plans work?</h3>
            <p className="text-gray-300">Our pricing is very simple - each subscription plan grants you a fixed number of monthly/yearly credits, or you can make a one-time purchase of credits whether you are on a recurring plan or not.Every time you generate alt text for an image (via API call, plugins, or using our website), you use one credit.Unused credits roll over at the end of each billing period. You can see your usage and remaining credits on your Dashboard page.Plans can be cancelled at any time.</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md">
            <h3 className="font-semibold text-white">Question 3: What happens if I cancel my plan?</h3>
            <p className="text-gray-300">When you cancel your subscription plan, automatic renewals will be turned off and you will not be charged going forward. You will retain any unused credits in your account.</p>
        </div>
    </div>
</div> */}

      </div>
    </div>
  );
}
