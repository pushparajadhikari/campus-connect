import React from 'react';

interface Props { title: string; description?: string; action?: React.ReactNode; icon?: string; }

const EmptyState: React.FC<Props> = ({ title, description, action, icon = '📭' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
