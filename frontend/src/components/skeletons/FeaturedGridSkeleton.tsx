const FeaturedGridSkeleton = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center bg-zinc-800/50 rounded-lg overflow-hidden animate-pulse shadow-lg"
          >
            {/* Image placeholder */}
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-zinc-700 to-zinc-600 flex-shrink-0" />
  
            {/* Text placeholders */}
            <div className="flex-1 p-4">
              {/* Title placeholder */}
              <div className="h-4 bg-zinc-700 rounded-md w-3/4 mb-3" />
              {/* Subtitle placeholder */}
              <div className="h-3 bg-zinc-700 rounded-md w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default FeaturedGridSkeleton;