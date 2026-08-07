import React, { useEffect } from 'react';

export const SEO = ({
  title = 'LuxeFinance — Personal Expense Tracker & Financial Dashboard',
  description = 'Track your income, manage expenses, set budget targets, and analyze solvency trends with LuxeFinance.',
  canonicalUrl = 'https://luxefinance.app',
}) => {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [title, description]);

  return null;
};
