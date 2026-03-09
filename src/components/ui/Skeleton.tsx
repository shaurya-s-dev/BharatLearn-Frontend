"use client";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`skeleton h-4 w-full ${className}`} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-1.5 w-full mt-3" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="page space-y-5 animate-fade-in">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
    />
  );
}
