const UsersListSkeleton = () => {
  return Array.from({ length: 4 }).map((_, i) => (
    <div
      key={i}
      className="flex items-center justify-between lg:justify-start gap-4 p-4 rounded-lg animate-pulse bg-zinc-900 shadow-md"
    >
      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800" />

      <div className="flex-1">
        <div className="h-5 w-28 bg-gradient-to-r from-zinc-600 to-zinc-700 rounded mb-2" />
        <div className="h-4 w-36 bg-gradient-to-r from-zinc-600 to-zinc-700 rounded" />
      </div>

      <div className="h-8 w-12 lg:block hidden bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-md" />
    </div>
  ));
};

export default UsersListSkeleton;
