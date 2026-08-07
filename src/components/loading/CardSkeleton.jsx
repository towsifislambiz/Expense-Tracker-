import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const CardSkeleton = () => {
  return (
    <div className="card-locked p-5 h-[155px] flex flex-col justify-between animate-pulse">
      <div className="flex items-start space-x-3.5">
        <Skeleton height="h-11" width="w-11" className="rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton height="h-3" width="w-20" />
          <Skeleton height="h-7" width="w-32" />
        </div>
      </div>
      <Skeleton height="h-3" width="w-24" />
    </div>
  );
};
