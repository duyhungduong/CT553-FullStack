import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({title}: {title: string}) => {
  const navigate = useNavigate();

  const handleBackward = () => {
    navigate(-1); // Go to the previous page in history
  };

  const handleForward = () => {
    navigate(1); // Go to the next page in history
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2 bg-zinc-800/80 border-b border-zinc-700 shadow-md z-10 sticky top-14">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={handleBackward}
          className="rounded-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleForward}
          className="rounded-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <span className="text-zinc-300 text-lg font-medium truncate max-w-xs">
          {title || "All Artists"}
        </span>
      </div>
      {/* Optional: Add additional controls or info here */}
    </div>
  );
};

export default Header;
