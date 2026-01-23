import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Table, Button, Grid, Input } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { borrowingColumns } from "../../../columns/borrowing.columns";
import type { BorrowingItem } from "../../../types/borrowing";
import { showNotification, showNotificationError } from "../../../utils";
import {
  deleteBorrowing,
  fetchBorrowing,
  updateStatusBorrowing,
} from "../../../utils/apis";
import dayjs from "dayjs";

const { useBreakpoint } = Grid;

const BorrowingDefault: React.FC = () => {
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
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  const loadBorrowing = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetchBorrowing();
      const list: BorrowingItem[] =
        response?.data?.data ?? response?.data?.response ?? [];

      const cleaned = list.filter(
        (item) => item.borrowers_name !== "TOTAL DATA",
      );

      setBorrowing(cleaned);
      setFilteredBorrowing(
        cleaned.filter(
          (item) =>
            (item.status || "menunggu di setujui") === "menunggu di setujui",
        ),
      );
    } catch (error) {
      console.error("Error fetching borrowing:", error);
      showNotificationError("Gagal mengambil data peminjaman!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBorrowing();
  }, [loadBorrowing]);

  useEffect(() => {
    const nextSize = isMobile ? 5 : 10;
    setPagination((p) =>
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 },
    );
  }, [isMobile]);

  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    if (!query) {
      setFilteredBorrowing(
        borrowing.filter(
          (item) =>
            (item.status || "menunggu di setujui") === "menunggu di setujui",
        ),
      );
      return;
    }

    const q = query.toLowerCase();
    const active = borrowing.filter(
      (item) =>
        (item.status || "menunggu di setujui") === "menunggu di setujui",
    );
    setFilteredBorrowing(
      active.filter(
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
    navigate(`/admin/borrowing/edit/${uuid}`);
  };

  const handleStatusChange = async (uuid: string, status: string) => {
    try {
      const item = borrowing.find((b) => b.uuid === uuid);
      if (!item) return;

      const updateData = {
        id_archive: item.id_archive,
        borrowers_name: item.borrowers_name,
        division: item.division || "",
        loan_date: item.loan_date || "",
        return_date:
          status === "dikembalikan" ? dayjs().format("YYYY-MM-DD") : "",
        status: status,
      };

      await updateStatusBorrowing(uuid, updateData);
      showNotification("Status peminjaman berhasil diperbarui!");

      // Reload data immediately
      await loadBorrowing();
    } catch (error) {
      console.error("Error updating status:", error);
      showNotificationError("Gagal memperbarui status peminjaman!");
    }
  };

  const columns = borrowingColumns({
    current: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
    onDelete: handleDelete,
    onEdit: handleEdit,
    onStatusChange: handleStatusChange,
  });

  return (
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
          onClick={() => navigate("/admin/borrowing/create")}
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
          setPagination({
            current: pag.current,
            pageSize: pag.pageSize,
          })
        }
        scroll={{ x: "max-content" }}
        style={{ fontSize: 14 }}
      />
    </div>
  );
};

export default BorrowingDefault;
