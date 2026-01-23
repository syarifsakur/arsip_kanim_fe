import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { UserForm } from "../../../components/manage_user";
import { createUser } from "../../../utils/apis";
import { showNotification, showNotificationError } from "../../../utils";

type UserFormPayload = {
  username: string;
  password?: string;
  role: string;
  division: string;
};

const ManageUserCreate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: UserFormPayload) => {
    try {
      setIsSubmitting(true);
      await createUser(data);

      showNotification("User berhasil dibuat!");
      navigate("/admin/manage-users");
    } catch (error) {
      console.error(error);
      const err = error as { response?: { data?: { msg?: string } } };
      const msg = err?.response?.data?.msg || "Gagal membuat user!";

      showNotificationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
};

export default ManageUserCreate;
