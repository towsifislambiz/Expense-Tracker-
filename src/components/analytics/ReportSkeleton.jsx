import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ReportSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 card-locked p-6 space-y-4">
          <Skeleton height="h-6" width="w-40" />
          <Skeleton height="h-24" width="w-full" className="rounded-xl" />
          <Skeleton height="h-4" width="w-full" />
        </div>
        <div className="lg:col-span-7 card-locked p-6 space-y-4">
          <Skeleton height="h-6" width="w-48" />
          <Skeleton height="h-60" width="w-full" className="rounded-xl" />
        </div>
      </div>
    </div>
  );
};
