import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { LoginForm } from "./components/FormLogin";

const LoginPage = () => {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10"
      style={{ backgroundImage: "url('./login-bg-pattern.png')" }}
    >
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignedOut>
          <LoginForm />
        </SignedOut>
        <SignedIn>
          <div className="flex flex-col justify-center items-center gap-2">
            <UserButton />
            <p className="font-outfit mb-4">Welcome back! You are signed</p>
          </div>
          <Link to={"/"}>
            <Button variant={"outline"} className="w-full">
              Go to Home
            </Button>
          </Link>
        </SignedIn>
      </div>
      <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-outfit font-light">
        Powered by{" "}
        <Link
          to={"/"}
          target="_blank"
          className="hover:underline text-[#334CA3]"
        >
          Melodia
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
