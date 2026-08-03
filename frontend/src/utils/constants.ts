export const SITE_TITLE = 'eips.wtf';
export const SITE_DESCRIPTION =
  'Track Ethereum Improvement Proposal activity, last-call deadlines, and recent changes.';
export const SITE_DOMAIN = 'www.eips.wtf';
export const SITE = `https://${SITE_DOMAIN}`;
export const SITE_BANNER = '/ogp_banner.png';
export const SITE_TWITTER = '@0xren_cf';
export const GITHUB_REPO_URL = 'https://github.com/rencryptofish/eips-wtf';

export const EIP_CATEGORIES = [
  'All',
  'Core',
  'Networking',
  'Interface',
  'ERC',
  'Meta',
  'Informational',
] as const;

export type EIPCategory = (typeof EIP_CATEGORIES)[number];
export type CategorySlug = Lowercase<EIPCategory>;

export const CATEGORY_DETAILS: Record<CategorySlug, { label: EIPCategory; description: string }> = {
  all: {
    label: 'All',
    description: 'A clear view of proposal work across the Ethereum standards ecosystem.',
  },
  core: {
    label: 'Core',
    description: 'Changes that affect Ethereum consensus and execution rules.',
  },
  networking: {
    label: 'Networking',
    description: 'Peer-to-peer networking and protocol communication proposals.',
  },
  interface: {
    label: 'Interface',
    description: 'Client APIs, RPC methods, and language-level interfaces.',
  },
  erc: {
    label: 'ERC',
    description: 'Application-level standards for tokens, wallets, and contracts.',
  },
  meta: {
    label: 'Meta',
    description: 'Process, governance, and coordination proposals for Ethereum.',
  },
  informational: {
    label: 'Informational',
    description: 'Design guidance and information for the Ethereum community.',
  },
};

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.hasOwn(CATEGORY_DETAILS, value);
}
