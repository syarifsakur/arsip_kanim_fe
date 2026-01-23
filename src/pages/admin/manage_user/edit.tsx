import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { showNotification, showNotificationError } from "../../../utils";
import { getUserById, updateUser } from "../../../utils/apis";
import { UserForm } from "../../../components/manage_user";
import type { User } from "../../../types";

type UserFormPayload = {
  username: string;
  password?: string;
  role: string;
  division: string;
};

const ManageUserEdit: React.FC = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<Partial<User> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!uuid) return;
      try {
        setIsLoading(true);
        const res = await getUserById(uuid);
        console.log("tes",res);
        const data = res?.data;
        setInitialValues(data);
      } catch (error) {
        console.error(error);
        showNotificationError("Gagal memuat data user");
        navigate("/admin/manage-users");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [uuid, navigate]);

  const handleSubmit = async (data: UserFormPayload) => {
    if (!uuid) {
      showNotificationError("UUID tidak ditemukan!");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser(uuid, data);

      showNotification("User berhasil diperbarui!");
      navigate("/admin/manage-users");
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { msg?: string } } };
      const msg = err?.response?.data?.msg || "Gagal memperbarui user!";

      showNotificationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6">
          <p>Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        {initialValues && (
          <UserForm
            initialValues={initialValues}
            mode="edit"
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUserEdit;
