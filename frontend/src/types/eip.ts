export interface EIP {
  eip: number;
  title: string;
  author: string;
  status: string;
  type: string;
  category: string | null;
  created: string;
  requires: number[] | null;
  last_call_deadline: string | null;
}
