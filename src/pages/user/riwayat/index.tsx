import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Table, Grid, Space, Input, Button, Tag, Tooltip } from "antd";
import type { TablePaginationConfig, ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { MdDownload, MdDescription, MdInsertDriveFile } from "react-icons/md";
import type { BorrowingItem } from "../../../types/borrowing";
import { showNotificationError } from "../../../utils";
import { getBorrowingUser } from "../../../utils/apis";

const { useBreakpoint } = Grid;

const Riwayat: React.FC = () => {
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
      const response = await getBorrowingUser();

      const list: BorrowingItem[] = response?.data?.data ?? [];

      console.log("Response riwayat:", response);
      console.log("List data:", list);

      setBorrowing(list);

      setFilteredBorrowing(list);
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
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 },
    );
  }, [isMobile]);

  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    if (!query) {
      setFilteredBorrowing(
        borrowing.filter(
          (item) =>
            (item.status || "").toLowerCase() === "sudah disetujui" ||
            (item.status || "").toLowerCase() === "di tolak",
        ),
      );
      return;
    }

    const q = query.toLowerCase();
    const completed = borrowing.filter(
      (item) =>
        (item.status || "").toLowerCase() === "sudah disetujui" ||
        (item.status || "").toLowerCase() === "di tolak",
    );
    setFilteredBorrowing(
      completed.filter(
        (item) =>
          String(item.borrowers_name || "")
            .toLowerCase()
            .includes(q) ||
          String(item.division || "")
            .toLowerCase()
            .includes(q) ||
          String(item.archive?.application_number || "")
            .toLowerCase()
            .includes(q),
      ),
    );
  }, [query, borrowing]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const columns: ColumnsType<BorrowingItem> = [
    {
      key: "no",
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>NO.</span>,
      align: "center",
      width: 70,
      render: (_: BorrowingItem, __: BorrowingItem, index: number) => (
        <span style={{ fontSize: 16 }}>
          {(pagination.current! - 1) * (pagination.pageSize || 10) + index + 1}
        </span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>No. Permohonan</span>
      ),
      dataIndex: ["archive", "application_number"],
      key: "application_number",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>Nama Peminjam</span>
      ),
      dataIndex: "borrowers_name",
      key: "borrowers_name",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Divisi</span>,
      dataIndex: "division",
      key: "division",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>Tgl. Peminjaman</span>
      ),
      dataIndex: "loan_date",
      key: "loan_date",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{formatDate(text)}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>Tgl. Pengembalian</span>
      ),
      dataIndex: "return_date",
      key: "return_date",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{formatDate(text)}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>File Arsip</span>,
      key: "file",
      align: "center",
      render: (_: unknown, record: BorrowingItem) => {
        const archiveRecord = record.archive as Record<string, unknown>;
        const filePath = archiveRecord?.file_path as string | undefined;
        const fileName = archiveRecord?.file as string | undefined;

        if (!filePath) {
          return <span style={{ fontSize: 16 }}>-</span>;
        }

        // Ekstrak nama file dari file_path jika file tidak ada
        const displayName = fileName || filePath.split("/").pop() || "File";

        // Tentukan icon berdasarkan tipe file
        const getFileIcon = (name: string) => {
          const ext = name.toLowerCase().split(".").pop();
          if (ext === "pdf") {
            return <MdDescription size={24} color="#FF4444" />;
          }
          return <MdInsertDriveFile size={24} color="#0066CC" />;
        };

        return (
          <div
            onClick={() => {
              const link = document.createElement("a");
              link.href = filePath;
              link.download = displayName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
            title={`Click to download: ${displayName}`}
          >
            {getFileIcon(displayName)}
            {/* <span
              style={{ fontSize: 12, textAlign: "center", maxWidth: "100px" }}
            >
              {String(displayName).length > 20
                ? String(displayName).substring(0, 17) + "..."
                : displayName}
            </span> */}
          </div>
        );
      },
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>STATUS</span>,
      key: "status",
      align: "center",
      render: (_, record) => {
        const status = record.status || "-";
        const color =
          status.toLowerCase() === "sudah disetujui"
            ? "green"
            : status.toLowerCase() === "di tolak"
              ? "red"
              : "default";

        return (
          <Tag color={color} style={{ fontSize: 14, fontWeight: 600 }}>
            {status}
          </Tag>
        );
      },
    },
  ];

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
            placeholder="Cari nama peminjam, divisi, atau no. permohonan..."
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
