import { Home, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-900 to-blue-950 flex items-center justify-center overflow-hidden">
      <div className="relative text-center space-y-8 px-4 max-w-2xl mx-auto">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Animated musical note with glow */}
        <div className="flex justify-center animate-bounce">
          <div className="relative">
            <Music2 className="h-24 w-24 text-blue-500 relative z-10" />
            <div className="absolute inset-0 h-24 w-24 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Enhanced error message */}
        <div className="space-y-6">
          <h1 className="text-8xl font-bold text-white tracking-tight drop-shadow-lg">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-white bg-neutral-800/50 px-6 py-2 rounded-lg inline-block shadow-lg">
            Page Not Found
          </h2>
          <p className="text-neutral-300 max-w-md mx-auto leading-relaxed">
            Looks like this track got lost in the shuffle. Don't worry, we'll get you back to the rhythm in no time!
          </p>
        </div>

        {/* Enhanced action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="group relative overflow-hidden bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600 w-full sm:w-auto px-8 py-6 text-lg transition-all duration-300"
          >
            <span className="relative z-10">Go Back</span>
            <div className="absolute inset-0 bg-blue-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-6 text-lg transition-all duration-300"
          >
            <Home className="mr-2 h-5 w-5 group-hover:animate-spin" />
            <span className="relative z-10">Back to Home</span>
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Button>
        </div>

        {/* Additional footer */}
        <div className="mt-12 text-neutral-500 text-sm animate-fade-in">
          <p>Can't find what you're looking for? Contact our support team!</p>
          <a href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
            Get Help →
          </a>
        </div>
      </div>
    </div>
  );
}