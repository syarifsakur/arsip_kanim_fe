export interface BorrowingItem {
  uuid: string;
  id_archive: string;
  borrowers_name: string;
  division?: string;
  loan_date?: string;
  return_date?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  archive?: {
    uuid: string;
    application_number: string;
    full_name?: string;
  };
}
