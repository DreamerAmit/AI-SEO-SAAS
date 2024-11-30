import { useNavigate } from 'react-router-dom';
import {
    ArrowPathIcon,
    CloudArrowUpIcon,
    LockClosedIcon,
  } from "@heroicons/react/20/solid";
  
export const Help = [
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
  
  export default function AppHelp() {
    const navigate = useNavigate();

    const handleContactSupport = () => {
      navigate('/support');
    };

    return (
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Need Help?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              If you have any issues while using our app or suggestions to make it better, we're here to help. Click below to reach our support team.
            </p>

            <div className="mt-10">
              <button
                onClick={handleContactSupport}
                className="rounded-md bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 ease-in-out"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
