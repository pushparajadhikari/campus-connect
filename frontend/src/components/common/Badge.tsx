import React from 'react';
import { categoryColors, categoryIcons } from '../../utils';

interface Props { slug: string; name: string; showIcon?: boolean; }

const CategoryBadge: React.FC<Props> = ({ slug, name, showIcon = true }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[slug] || 'bg-gray-100 text-gray-700'}`}>
    {showIcon && <span>{categoryIcons[slug] || '📌'}</span>}
    {name}
  </span>
);

export default CategoryBadge;
