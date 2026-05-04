import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Table, Button, Grid, Input } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { borrowingColumns } from "../../../columns/borrowing.columns";
import type { BorrowingItem } from "../../../types/borrowing";
import {
  showNotification,
  showNotificationError,
  getItem,
} from "../../../utils";
import { deleteBorrowing, getBorrowingUser } from "../../../utils/apis";

const { useBreakpoint } = Grid;

const BorrowingPage: React.FC = () => {
  const [borrowing, setBorrowing] = useState<BorrowingItem[]>([]);
  const [filteredBorrowing, setFilteredBorrowing] = useState<BorrowingItem[]>(
    [],
  );
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  const loadBorrowing = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getBorrowingUser();
      console.log("Borrowing user response:", response);
      const list: BorrowingItem[] = response?.data?.data ?? [];
      console.log("List data:", list);
      console.log("List length:", list.length);

      // Ambil user ID dari localStorage
      const profile = getItem("profile");
      const currentUserId = profile?.data?.id;
      console.log("Current user ID:", currentUserId);
      console.log("Profile data:", profile);

      // Log setiap item untuk debugging
      console.log("=== DEBUGGING FILTER ===");
      list.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          uuid: item.uuid,
          borrowers_name: item.borrowers_name,
          status: item.status,
          created: item.created,
          created_by: item.created_by,
          user_id: item.user_id,
          id_user: item.id_user,
          allFields: Object.keys(item),
        });
      });

      // Filter hanya borrowing yang dibuat oleh user yang login dan status "menunggu disetujui"
      const userBorrowings = list.filter((item, index) => {
        const itemUserId =
          item.created || item.created_by || item.user_id || item.id_user;

        // Filter berdasarkan user ID dan status
        const isUserBorrowing =
          itemUserId === currentUserId ||
          itemUserId === String(currentUserId) ||
          String(itemUserId) === String(currentUserId);

        const isPending =
          !item.status ||
          item.status === "menunggu di setujui" ||
          item.status?.toLowerCase() === "menunggu di setujui" ||
          item.status === "menunggu disetujui" ||
          item.status?.toLowerCase() === "menunggu disetujui" ||
          item.status === "pending" ||
          item.status?.toLowerCase() === "pending";

        console.log(`Item ${index} filter result:`, {
          itemUserId,
          currentUserId,
          isUserBorrowing,
          status: item.status,
          isPending,
          passFilter: isUserBorrowing && isPending,
        });

        return isUserBorrowing && isPending;
      });

      console.log("=== FILTER RESULT ===");
      console.log("Total items:", list.length);
      console.log("Filtered count:", userBorrowings.length);
      console.log("Filtered items:", userBorrowings);

      setBorrowing(userBorrowings);
      setFilteredBorrowing(userBorrowings);
    } catch (error) {
      console.error("Error fetching borrowing:", error);
      showNotificationError("Gagal mengambil data peminjaman!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBorrowing();
  }, [loadBorrowing, location.key]);

  useEffect(() => {
    const nextSize = isMobile ? 5 : 10;
    setPagination((p) =>
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 },
    );
  }, [isMobile]);

  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    if (!query) {
      setFilteredBorrowing(borrowing);
      return;
    }

    const q = query.toLowerCase();
    setFilteredBorrowing(
      borrowing.filter(
        (item) =>
          String(item.borrowers_name || "")
            .toLowerCase()
            .includes(q) ||
          String(item.division || "")
            .toLowerCase()
            .includes(q),
      ),
    );
  }, [query, borrowing]);

  const handleDelete = async (uuid: string) => {
    try {
      await deleteBorrowing(uuid);
      showNotification("Data peminjaman berhasil dihapus!");
      loadBorrowing();
    } catch (error) {
      console.error("Error deleting borrowing:", error);
      showNotificationError("Gagal menghapus data peminjaman!");
    }
  };

  const handleEdit = (uuid: string) => {
    navigate(`/user/borrowing/edit/${uuid}`);
  };

  const columns = borrowingColumns({
    current: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
    onDelete: handleDelete,
    onEdit: handleEdit,
    showFileColumn: false,
    hideEditButton: true,
  });

  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Input
            placeholder="Cari nama peminjam atau divisi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: "300px" }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/user/borrowing/create")}
            size="large"
          >
            Tambah Peminjaman
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBorrowing}
          rowKey="uuid"
          loading={isLoading}
          pagination={pagination}
          onChange={(pag) =>
            setPagination({ current: pag.current, pageSize: pag.pageSize })
          }
          scroll={{ x: "max-content" }}
          style={{ fontSize: 14 }}
        />
      </div>
    </AdminLayout>
  );
};

export default BorrowingPage;
