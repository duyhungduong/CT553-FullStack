import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-900 rounded-lg shadow-md">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="rounded-full bg-zinc-800 p-1 hover:shadow-lg transition-shadow"
        >
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>

        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Music Manager
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-1">
            Manage your music catalog
          </p>
        </div>
      </div>

      {/* User Button */}
      <div className="flex-shrink-0">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10",
              userButtonPopoverCard: "bg-zinc-800 shadow-lg border border-zinc-700",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Header;
