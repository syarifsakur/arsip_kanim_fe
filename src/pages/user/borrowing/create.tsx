import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import BorrowingForm from "../../../components/borrowing/form";
import { fetchArchive, createBorrowing } from "../../../utils/apis";
import { showNotification, showNotificationError } from "../../../utils";

type ArchiveOption = { uuid: string; application_number: string };

const BorrowingCreate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archives, setArchives] = useState<ArchiveOption[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadArchives = async () => {
      try {
        const response = await fetchArchive();
        const list: ArchiveOption[] =
          response?.data?.data ?? response?.data?.response ?? [];
        setArchives(list);
      } catch (error) {
        console.error(error);
        showNotificationError("Gagal mengambil data arsip!");
      }
    };

    loadArchives();
  }, []);

  const handleSubmit = async (data: {
    id_archive: string;
    borrowers_name: string;
    division?: string;
    loan_date?: string;
    return_date?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await createBorrowing(data);

      showNotification("Berhasil menambahkan data peminjaman!");
      navigate("/user/borrowing");
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { msg?: string } } };
      const msg =
        err?.response?.data?.msg || "Gagal menambahkan data peminjaman!";

      showNotificationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <BorrowingForm
          archives={archives}
          onSubmit={handleSubmit}
          mode="create"
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
};

export default BorrowingCreate;
