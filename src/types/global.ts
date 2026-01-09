export interface Pagination {
  current: number;
  pageSize: number;
  total?: number;
}

export type TableProps = {
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onReject?: (record: any, reason: string) => void;
  onDetail?: (record: any) => void;
  onStatusChange?: (record: any, value: string) => void;
  isLoading?: boolean;
  pagination: Pagination;
};