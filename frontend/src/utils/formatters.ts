const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const numberFormatter = new Intl.NumberFormat('en-US');
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

export function formatCompactNumber(value: number): string {
  return compactNumberFormatter.format(value);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatMonth(value: string): string {
  return monthFormatter.format(new Date(value));
}

export function formatShortMonth(value: string): string {
  return shortMonthFormatter.format(new Date(value));
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRelativeDate(value: string, referenceTime: string): string {
  const seconds = (new Date(value).getTime() - new Date(referenceTime).getTime()) / 1_000;
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ] as const;

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relativeTimeFormatter.format(Math.round(seconds / secondsInUnit), unit);
    }
  }

  return 'just now';
}
