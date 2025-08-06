const SectionGridSkeleton = () => {
    return (
      <div className="mb-10">
        {/* Section Title Placeholder */}
        <div className="flex items-center justify-between mb-2">
        <div className="h-8 w-56 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-lg mb-6 animate-pulse" />
        <div className="h-8 w-20 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-lg mb-6 animate-pulse"/>
        </div>
        
        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-800/40 p-5 rounded-xl animate-pulse shadow-md hover:shadow-lg transition-shadow duration-1000"
            >
              {/* Image Placeholder */}
              <div className="aspect-square rounded-lg bg-gradient-to-r from-zinc-700 to-zinc-600 mb-6" />
              
              {/* Title Placeholder */}
              <div className="h-4 bg-zinc-700 rounded-md w-3/4 mb-3" />
              
              {/* Subtitle Placeholder */}
              <div className="h-4 bg-zinc-700 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default SectionGridSkeleton;