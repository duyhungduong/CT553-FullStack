// SignUpPage.jsx
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignUpForm } from "./components/SignUpForm";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
// } from "@/components/ui/navigation-menu";

const SignUpPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-br from-zinc-900 to-black overflow-hidden overflow-y-hidden"
      style={{ backgroundImage: "url('./login-bg-pattern.png')" }}
    >
      <div className="w-full max-w-sm md:max-w-3xl">

        <SignedOut>
          <SignUpForm />
        </SignedOut>
        <SignedIn>
          <div className="flex flex-col justify-center items-center gap-4">
            <UserButton />
            <p className="font-outfit mb-4 text-white">
              You're already signed in!
            </p>
            <Button
              variant="outline"
              className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => navigate("/")}
            >
              Go to Home
            </Button>
          </div>
        </SignedIn>
      </div>
      <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-zinc-400 font-outfit font-light">
        Powered by{" "}
        <Link
          to="/"
          target="_blank"
          className="hover:underline text-emerald-400"
        >
          Melodia
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
