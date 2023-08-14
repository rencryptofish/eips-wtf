export interface EIPDiffsWithCommits {
  hexsha: string;
  eip: number;
  title: string;
  committed_datetime: string;
  authored_datetime: string;
  message: string;
  author_email: string;
  author_name: string;
  type: string;
  category: string;
  discussion: string | null;
  discussion_count: number | null;
}

export interface EIPDiffsPerMonth {
  month: string;
  category: string;
  count: number;
}
