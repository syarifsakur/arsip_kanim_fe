import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { showNotification, showNotificationError } from "../../../utils";
import { createArchive } from "../../../utils/apis";
import ArchiveForm from "../../../components/archive/form/index"; // ✅ sesuaikan path komponen kamu

const ArchiveCreate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await createArchive(formData);

      showNotification("Berhasil menambahkan data archive!");
      navigate("/admin/arsip");
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.response?.data?.img ||
        error?.response?.data?.msg ||
        "Gagal menambahkan data archive!";

      showNotificationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <ArchiveForm
          mode="create"
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default ArchiveCreate;
