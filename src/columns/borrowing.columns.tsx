import { Button, Tooltip, Popconfirm, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  MdDelete,
  MdEdit,
  MdDescription,
  MdInsertDriveFile,
} from "react-icons/md";
import type { BorrowingItem } from "../types/borrowing";

type Props = {
  current: number;
  pageSize: number;
  onDelete: (uuid: string) => void;
  onEdit: (uuid: string) => void;
  onStatusChange?: (uuid: string, status: string) => void;
  showFileColumn?: boolean;
};

export const borrowingColumns = ({
  current,
  pageSize,
  onDelete,
  onEdit,
  onStatusChange,
  showFileColumn = true,
}: Props): ColumnsType<BorrowingItem> => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const baseColumns: ColumnsType<BorrowingItem> = [
    {
      key: "no",
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>NO.</span>,
      align: "center",
      render: (_: BorrowingItem, __: BorrowingItem, index: number) => (
        <span style={{ fontSize: 16 }}>
          {(current - 1) * pageSize + index + 1}
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
  ];

  const fileColumn = {
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
          <span
            style={{ fontSize: 12, textAlign: "center", maxWidth: "100px" }}
          >
            {String(displayName).length > 20
              ? String(displayName).substring(0, 17) + "..."
              : displayName}
          </span>
        </div>
      );
    },
  };

  const columns: ColumnsType<BorrowingItem> = [
    ...baseColumns,
    ...(showFileColumn ? [fileColumn] : []),
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>STATUS</span>,
      key: "status",
      align: "center",
      render: (_, record) => {
        const status = record.status || "dipinjam";

        return onStatusChange ? (
          <Select
            value={status}
            onChange={(value) => onStatusChange(record.uuid, value)}
            style={{ width: 140 }}
            options={[
              {
                label: "menunggu di setujui",
                value: "menunggu di setujui",
              },
              {
                label: "sudah disetujui",
                value: "sudah disetujui",
              },
              {
                label: "di tolak",
                value: "di tolak",
              },
            ]}
          />
        ) : (
          <Tag color={status === "menunggu di setujui" ? "yellow" : "green"}>
            {status === "menunggu di setujui"
              ? "menunggu di setujui"
              : status === "sudah disetujui"
                ? "sudah disetujui"
                : "di tolak"}
          </Tag>
        );
      },
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>AKSI</span>,
      key: "action",
      align: "center",
      render: (_: BorrowingItem, record: BorrowingItem) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<MdEdit size={18} />}
              onClick={() => onEdit(record.uuid)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Hapus Data?"
            description="Apakah Anda yakin ingin menghapus data ini?"
            onConfirm={() => onDelete(record.uuid)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Tooltip title="Hapus">
              <Button
                danger
                icon={<MdDelete size={18} />}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return columns;
};
