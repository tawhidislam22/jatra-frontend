"use client";

export function NavbarAvatarSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse" aria-hidden="true">
      <div className="h-9 w-28 bg-gray-200 rounded-sm hidden sm:block" />
      <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300" />
    </div>
  );
}
