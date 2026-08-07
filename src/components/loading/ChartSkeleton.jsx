import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ChartSkeleton = () => {
  return (
    <div className="card-locked p-6 h-80 flex flex-col justify-between animate-pulse">
      <Skeleton height="h-6" width="w-48" />
      <Skeleton height="h-56" width="w-full" className="rounded-xl" />
    </div>
  );
};
