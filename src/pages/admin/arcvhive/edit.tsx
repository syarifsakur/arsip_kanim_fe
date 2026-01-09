import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { showNotification, showNotificationError } from "../../../utils";
import { fetchArchiveById, updateArchive } from "../../../utils/apis";
import { ArchiveForm } from "../../../components/archive";

const ArchiveEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetchArchiveById(id);
        const data = res?.data?.data ?? res?.data ?? null;
        setInitialValues(data);
      } catch (error) {
        console.error(error);
        showNotificationError("Gagal memuat data archive");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    if (!id) return;
    try {
      await updateArchive(id, formData);
      showNotification("Berhasil memperbarui data archive!");
      navigate("/admin/arsip");
    } catch (error) {
      console.error(error);
      showNotificationError("Gagal memperbarui data archive!");
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <ArchiveForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default ArchiveEdit;
