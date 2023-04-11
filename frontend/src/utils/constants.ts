export const EIP_CATEGORIES = [
  'All',
  'Core',
  'Networking',
  'Interface',
  'ERC',
  'Meta',
  'Informational',
  'Unknown',
];

export type CategoryColors = {
  meta: string;
  unknown: string;
  core: string;
  networking: string;
  erc: string;
  informational: string;
  interface: string;
};

export const EIP_CATEGORIES_COLOR: CategoryColors = {
  meta: '#8884d8',
  unknown: '#82ca9d',
  core: '#ffc658',
  networking: '#0088FE',
  erc: '#00C49F',
  informational: '#FFBB28',
  interface: '#FF8042',
};

export function getCategoryColor(category: string): string {
  return EIP_CATEGORIES_COLOR[category as keyof CategoryColors];
}
