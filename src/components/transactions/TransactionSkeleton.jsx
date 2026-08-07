import React from 'react';
import { Skeleton } from '../common/Skeleton';

export const TransactionSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="card-locked p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton height="h-10" width="w-full md:w-64" className="rounded-xl" />
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Skeleton height="h-9" width="w-24" className="rounded-xl" />
          <Skeleton height="h-9" width="w-24" className="rounded-xl" />
          <Skeleton height="h-9" width="w-24" className="rounded-xl" />
        </div>
      </div>

      <div className="card-locked p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <div className="flex items-center space-x-3">
              <Skeleton height="h-10" width="w-10" className="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton height="h-4" width="w-36" />
                <Skeleton height="h-3" width="w-24" />
              </div>
            </div>
            <Skeleton height="h-6" width="w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
