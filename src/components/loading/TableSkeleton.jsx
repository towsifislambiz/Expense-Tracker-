import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const TableSkeleton = () => {
  return (
    <div className="card-locked p-6 space-y-4 animate-pulse">
      <Skeleton height="h-6" width="w-48" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height="h-12" width="w-full" className="rounded-xl" />
      ))}
    </div>
  );
};
