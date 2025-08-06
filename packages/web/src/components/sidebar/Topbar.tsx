import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "../loginbutton/SignInOAuthButtons";
import { Button, buttonVariants } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

const Topbar = () => {
  const { isAdmin } = useAuthStore();

  // console.log({ isAdmin });
  return (
    <div
      className="flex items-center justify-between p-4 sticky top-0 bg-opacity-90
    backdrop-blur-md z-10
  "
    >
      <div className="flex gap-2 items-center">
        <Link
          to="/"
          className="rounded-full bg-zinc-800 p-1 hover:shadow-lg transition-shadow"
        >
          <img
            src="/logo.jpg"
            className="size-8  rounded-full object-cover"
            alt="Melodia logo"
          />
        </Link>

        <h1 className="text-lg sm:text-xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Melodia
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            to={"/admin"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <LayoutDashboardIcon className="size-4  mr-2" />
            Admin Dashboard
          </Link>
        )}

        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInOAuthButtons />
          <Button variant={"outline"}>
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </div>
  );
};

export default Topbar;
