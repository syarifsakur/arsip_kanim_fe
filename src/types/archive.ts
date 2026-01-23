export interface ArchiveItem {
  uuid: string;

  application_number: string; // nomor permohonan
  application_date: string | null; // tanggal permohonan (YYYY-MM-DD) bisa null
  application_type: string | null; // BARU / GANTI / dll
  no_archive: string | null; // nomor arsip

  passport_purpose: string | null; // WISATA / UMROH / HAJI / dll
  passport_number: string | null; // nomor paspor
  passport_type: string | null; // jenis paspor
  service_method: string | null; // layanan online / percepatan / dll

  full_name: string | null; // nama lengkap
  date_of_birth: string | null; // tanggal lahir (YYYY-MM-DD) bisa null
  gender: "L" | "P" | null; // L/P (kadang null)

  passport_registration_number: string | null; // nomor registrasi paspor
  issue_date: string | null; // tanggal terbit
  expiration_date: string | null; // tanggal kadaluarsa

  province: string | null; // provinsi
  district_city: string | null; // kab/kota
  sub_district: string | null; // kecamatan
  location: string | null; // lokasi

  file: string | null; // nama file (kalau ada)
  file_path: string | null; // url/path file (kalau ada)

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
