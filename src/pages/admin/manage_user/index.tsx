import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../../layouts";
import { Table, Button, Grid } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { TablePaginationConfig } from "antd/es/table";
import { showNotification, showNotificationError } from "../../../utils";
import { fetchUsers, deleteUser } from "../../../utils/apis";
import { userColumns } from "../../../columns";
import type { User } from "../../../types";

const { useBreakpoint } = Grid;

const ManageUserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });
  const navigate = useNavigate();

  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      showNotificationError("Gagal memuat data user!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user: User) => {
    navigate(`/admin/manage-users/edit/${user.uuid}`);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await deleteUser(uuid);
      showNotification("User berhasil dihapus!");
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotificationError("Gagal menghapus user!");
    }
  };

  const columns = userColumns({
    current: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
    onDelete: handleDelete,
    onEdit: handleEdit,
  });

  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h2>Kelola User</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/manage-users/create")}
            size="large"
          >
            Tambah User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="uuid"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: users.length,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
            showSizeChanger: false,
            position: isMobile ? ["bottomCenter"] : ["bottomRight"],
          }}
          scroll={{ x: "max-content" }}
          size={isMobile ? "small" : "middle"}
        />
      </div>
    </AdminLayout>
  );
};

export default ManageUserPage;
