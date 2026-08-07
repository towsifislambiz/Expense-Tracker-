import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const BudgetSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card-locked p-6 space-y-4">
        <Skeleton height="h-6" width="w-48" />
        <Skeleton height="h-10" width="w-full" className="rounded-xl" />
        <Skeleton height="h-4" width="w-3/4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-locked p-5 space-y-3">
            <Skeleton height="h-5" width="w-32" />
            <Skeleton height="h-8" width="w-24" />
            <Skeleton height="h-3" width="w-full" className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
