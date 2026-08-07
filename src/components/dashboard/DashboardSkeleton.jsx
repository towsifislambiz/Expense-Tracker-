import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Row 1: Stat Cards Skeleton (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-locked p-5 h-[155px] flex flex-col justify-between">
            <div className="flex items-start space-x-3.5">
              <Skeleton height="h-11" width="w-11" className="rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton height="h-3" width="w-20" />
                <Skeleton height="h-7" width="w-32" />
              </div>
            </div>
            <Skeleton height="h-3" width="w-24" />
          </div>
        ))}
      </div>

      {/* Row 2: Charts Skeleton (5 / 7 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 card-locked p-6 h-80 flex flex-col justify-between">
          <Skeleton height="h-5" width="w-40" />
          <div className="flex items-center justify-center py-4">
            <Skeleton height="h-44" width="w-44" className="rounded-full" />
          </div>
          <Skeleton height="h-4" width="w-full" />
        </div>
        <div className="lg:col-span-7 card-locked p-6 h-80 flex flex-col justify-between">
          <Skeleton height="h-5" width="w-48" />
          <Skeleton height="h-52" width="w-full" className="rounded-xl" />
        </div>
      </div>

      {/* Row 3: Widgets Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 card-locked p-6 space-y-4">
          <Skeleton height="h-6" width="w-48" />
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} height="h-12" width="w-full" className="rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-5 card-locked p-6 space-y-4">
          <Skeleton height="h-6" width="w-40" />
          <Skeleton height="h-20" width="w-full" className="rounded-xl" />
          <Skeleton height="h-20" width="w-full" className="rounded-xl" />
        </div>
      </div>
    </div>
  );
};
