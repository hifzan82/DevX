export const WEBSITE_CATEGORIES = ['Fintech', 'Gaming', 'E-commerce', 'Education', 'Healthcare', 'Government', 'General'];

export const categoryDescriptions = {
  Fintech: 'Financial services with transactions and data sensitivity',
  Gaming: 'Interactive games and media content',
  'E-commerce': 'Online stores and product catalogs',
  Education: 'Learning platforms and educational content',
  Healthcare: 'Medical and health information',
  Government: 'Public sector and civic services',
  General: 'General website content',
};

export function getCategoryContext(category) {
  if (!category || category === 'General') return '';
  return categoryDescriptions[category] || '';
}
