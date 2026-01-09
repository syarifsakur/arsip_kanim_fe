import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Table, Grid, Space, Input, Button } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { borrowingColumns } from "../../../columns/borrowing.columns";
import type { BorrowingItem } from "../../../types/borrowing";
import { showNotificationError } from "../../../utils";
import { fetchBorrowing, deleteBorrowing } from "../../../utils/apis";

const { useBreakpoint } = Grid;

const Riwayat: React.FC = () => {
  const [borrowing, setBorrowing] = useState<BorrowingItem[]>([]);
  const [filteredBorrowing, setFilteredBorrowing] = useState<BorrowingItem[]>(
    []
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
        (item) => item.borrowers_name !== "TOTAL DATA"
      );

      setBorrowing(cleaned);
      // tampilkan hanya yang status 'dikembalikan'
      setFilteredBorrowing(
        cleaned.filter((item) => (item.status || "dipinjam") === "dikembalikan")
      );
    } catch (error) {
      console.error("Error fetching borrowing:", error);
      showNotificationError("Gagal mengambil data riwayat peminjaman!");
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
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 }
    );
  }, [isMobile]);

  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    if (!query) {
      setFilteredBorrowing(
        borrowing.filter(
          (item) => (item.status || "dipinjam") === "dikembalikan"
        )
      );
      return;
    }

    const q = query.toLowerCase();
    const returned = borrowing.filter(
      (item) => (item.status || "dipinjam") === "dikembalikan"
    );
    setFilteredBorrowing(
      returned.filter(
        (item) =>
          String(item.borrowers_name || "")
            .toLowerCase()
            .includes(q) ||
          String(item.division || "")
            .toLowerCase()
            .includes(q)
      )
    );
  }, [query, borrowing]);

  const handleDelete = async (uuid: string) => {
    try {
      await deleteBorrowing(uuid);
      await loadBorrowing();
    } catch (error) {
      console.error("Error deleting borrowing:", error);
      showNotificationError("Gagal menghapus data riwayat peminjaman!");
    }
  };

  const columns = borrowingColumns({
    current: pagination.current!,
    pageSize: pagination.pageSize!,
    onDelete: handleDelete,
    onEdit: (uuid: string) => navigate(`/admin/borrowing/edit/${uuid}`),
    // tidak ada perubahan status di riwayat, jadi tidak kirim onStatusChange
  });

  return (
    <AdminLayout>
      <div style={{ padding: "8px 0" }}>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          className="w-full mb-4"
          size={isMobile ? "small" : "middle"}
          style={{ justifyContent: "space-between" }}
        >
          <Input.Search
            placeholder="Cari nama peminjam atau divisi..."
            allowClear
            enterButton
            value={query}
            onSearch={(v) => setQuery(String(v || ""))}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: isMobile ? "100%" : 360 }}
          />

          <Button type="default" onClick={loadBorrowing}>
            Muat Ulang
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredBorrowing}
          rowKey="uuid"
          loading={isLoading}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current!,
            pageSize: pagination.pageSize!,
            total: filteredBorrowing.length,
            onChange: (page, pageSize) =>
              setPagination((p) => ({ ...p, current: page, pageSize })),
            showSizeChanger: false,
            position: isMobile ? ["bottomCenter"] : ["bottomRight"],
            responsive: true,
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default Riwayat;
