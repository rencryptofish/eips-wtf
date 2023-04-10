export interface EIPDiffsWithCommits {
    hexsha: string;
    eip: number;
    committed_datetime: string;
    authored_datetime: string;
    message: string;
    author_email: string;
    author_name: string;
}
