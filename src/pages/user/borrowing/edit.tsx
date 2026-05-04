import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { showNotification, showNotificationError } from "../../../utils";
import {
  fetchBorrowingById,
  updateBorrowing,
  fetchArchive,
} from "../../../utils/apis";
import BorrowingForm from "../../../components/borrowing/form";
import type { BorrowingItem } from "../../../types/borrowing";

type ArchiveOption = { uuid: string; application_number: string };

const BorrowingEdit: React.FC = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] =
    useState<Partial<BorrowingItem> | null>(null);
  const [archives, setArchives] = useState<ArchiveOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      if (!uuid) return;
      try {
        setIsLoading(true);
        const res = await fetchBorrowingById(uuid);
        const data = res?.data?.data ?? res?.data ?? null;
        setInitialValues(data);
      } catch (error) {
        console.error(error);
        showNotificationError("Gagal memuat data peminjaman");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [uuid]);

  const handleSubmit = async (data: {
    id_archive: string;
    borrowers_name: string;
    division?: string;
    loan_date?: string;
    return_date?: string;
  }) => {
    if (!uuid) return;
    try {
      await updateBorrowing(uuid, data);
      showNotification("Berhasil memperbarui data peminjaman!");
      navigate("/user/borrowing", { replace: true });
    } catch (error) {
      console.error(error);
      showNotificationError("Gagal memperbarui data peminjaman!");
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <BorrowingForm
          mode="edit"
          initialValues={initialValues}
          archives={archives}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default BorrowingEdit;
