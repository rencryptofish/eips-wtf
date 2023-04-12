export const SITE_TITLE = 'eips.wtf';
export const SITE_DESCRIPTION = 'Enhanced stats for Ethereum Improvement Proposals (EIPs)';
export const SITE_DOMAIN = 'eips.wtf';
export const SITE = 'https://' + SITE_DOMAIN;
export const SITE_BANNER = '/ogp_banner.png';
export const SITE_TWITTER = '@0xren_cf';
export const BACKEND_URL = 'https://eips-wtf-server-production.up.railway.app';
export const GITHUB_REPO_URL = 'https://github.com/rencryptofish/eips-wtf';

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
