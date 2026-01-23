export interface User {
  uuid: string;
  username: string;
  // Support both legacy `divisi` and new `division`
  divisi?: string;
  division?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  username: string;
  password: string;
  division: string;
  role: string;
}
