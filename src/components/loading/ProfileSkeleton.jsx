import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card-locked p-6 flex items-center space-x-4">
        <Skeleton height="h-20" width="w-20" className="rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton height="h-6" width="w-48" />
          <Skeleton height="h-4" width="w-32" />
        </div>
      </div>
    </div>
  );
};
