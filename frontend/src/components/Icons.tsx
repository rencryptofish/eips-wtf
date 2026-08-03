import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg viewBox='0 0 20 20' fill='none' aria-hidden='true' {...props}>
      <path d='M6 14 14 6m0 0H7m7 0v7' stroke='currentColor' strokeWidth='1.7' />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox='0 0 20 20' fill='none' aria-hidden='true' {...props}>
      <path
        d='M5.5 2.75v2.5m9-2.5v2.5M3.25 7.5h13.5M5 4h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox='0 0 20 20' fill='none' aria-hidden='true' {...props}>
      <path
        d='m7.5 4.5 5.5 5.5-5.5 5.5'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.75'
      />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.98 10.98 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.06.79 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z' />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox='0 0 20 20' fill='none' aria-hidden='true' {...props}>
      <circle cx='8.75' cy='8.75' r='5.5' stroke='currentColor' strokeWidth='1.6' />
      <path d='m13 13 3.75 3.75' stroke='currentColor' strokeWidth='1.6' />
    </svg>
  );
}

export function EthereumMark(props: IconProps) {
  return (
    <svg viewBox='0 0 32 32' fill='none' aria-hidden='true' {...props}>
      <path d='m16 3-8 13 8 4.75L24 16 16 3Z' fill='currentColor' fillOpacity='.92' />
      <path d='m16 29-8-11.4 8 4.75 8-4.75L16 29Z' fill='currentColor' fillOpacity='.62' />
      <path d='M16 3v17.75L24 16 16 3Z' fill='white' fillOpacity='.2' />
    </svg>
  );
}
