import { config } from '@/lib/config';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton = ({ className = '', children }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
    {children}
  </div>
);

// Skeleton components for different content types
export const SongCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton className="h-40 w-full" /> {/* Album art */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" /> {/* Song title */}
      <Skeleton className="h-3 w-1/2" /> {/* Artist */}
    </div>
  </div>
);

export const PlaylistCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton className="h-32 w-full" /> {/* Playlist cover */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" /> {/* Playlist title */}
      <Skeleton className="h-3 w-2/3" /> {/* Song count */}
    </div>
  </div>
);

export const ArtistCardSkeleton = () => (
  <div className="p-4 text-center space-y-3">
    <Skeleton className="h-24 w-24 rounded-full mx-auto" /> {/* Artist avatar */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-20 mx-auto" /> {/* Artist name */}
      <Skeleton className="h-3 w-16 mx-auto" /> {/* Follower count */}
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }, (_, i) => (
      <td key={i} className="p-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Page-level loading components
interface PageLoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export const PageLoading = ({ 
  message = 'Loading...', 
  showSpinner = true 
}: PageLoadingProps) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0b2e] via-[#2e1a47] to-[#0f172a]">
    {showSpinner && (
      <LoadingSpinner size="xl" className="mb-4 border-purple-300 border-t-purple-600" />
    )}
    <p className="text-white text-lg font-medium">{message}</p>
    {config.IS_DEVELOPMENT && (
      <p className="text-gray-400 text-sm mt-2">Development mode</p>
    )}
  </div>
);

// Content loading with skeletons
interface ContentLoadingProps {
  type: 'songs' | 'playlists' | 'artists' | 'table';
  count?: number;
  columns?: number;
}

export const ContentLoading = ({ 
  type, 
  count = 8, 
  columns = 4 
}: ContentLoadingProps) => {
  const getSkeletonComponent = () => {
    switch (type) {
      case 'songs':
        return SongCardSkeleton;
      case 'playlists':
        return PlaylistCardSkeleton;
      case 'artists':
        return ArtistCardSkeleton;
      case 'table':
        return () => <TableRowSkeleton columns={columns} />;
      default:
        return SongCardSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  if (type === 'table') {
    return (
      <tbody>
        {Array.from({ length: count }, (_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </tbody>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};

// Loading states for specific actions
export const ButtonLoading = ({ 
  children, 
  loading = false, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} relative`}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    )}
    <span className={loading ? 'opacity-0' : ''}>
      {children}
    </span>
  </button>
);

// Lazy loading wrapper
interface LazyLoadingProps {
  loading: boolean;
  error?: Error;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children: React.ReactNode;
}

export const LazyLoading = ({ 
  loading, 
  error, 
  fallback = <PageLoading />, 
  errorFallback,
  children 
}: LazyLoadingProps) => {
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Loading Error</h3>
          <p className="text-gray-600">Failed to load content. Please try again.</p>
          {config.IS_DEVELOPMENT && (
            <details className="mt-4 text-left text-xs text-gray-500">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
