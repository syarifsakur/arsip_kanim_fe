import { Button, Tooltip, Popconfirm, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MdDelete, MdEdit } from "react-icons/md";
import { FaFilePdf, FaFileImage } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import type { ArchiveItem } from "../types/archive";

type Props = {
  current: number;
  pageSize: number;
  onDelete: (uuid: string) => void;
  onRestore?: (uuid: string) => void; // optional kalau mau dipakai
};

export const archiveColumns = ({
  current,
  pageSize,
  onDelete,
}: Props): ColumnsType<ArchiveItem> => {
  // ✅ navigate di dalam columns
  const navigate = useNavigate();

  return [
    {
      key: "no",
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>NO.</span>,
      align: "center",
      render: (_: any, __: any, index: number) => (
        <span style={{ fontSize: 16 }}>
          {(current - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>No. Permohonan</span>
      ),
      dataIndex: "application_number",
      key: "application_number",
      align: "center",
      render: (text: string, record: any) => {
        if (!text) return <span style={{ fontSize: 16 }}>-</span>;

        return (
          <Link
            to={`/admin/archive/detail/${record.uuid}`}
            style={{
              fontSize: 16,
              color: "#1677ff",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>No Arsip</span>,
      dataIndex: "no_archive",
      key: "no_archive",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Nama</span>,
      dataIndex: "full_name",
      key: "full_name",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Tujuan</span>,
      dataIndex: "passport_purpose",
      key: "passport_purpose",
      align: "center",
      render: (text: string) => (
        <span style={{ fontSize: 16 }}>{text || "-"}</span>
      ),
    },
    {
      title: (
        <span style={{ fontSize: 16, fontWeight: 600 }}>Jenis Permohonan</span>
      ),
      dataIndex: "application_type",
      key: "application_type",
      align: "center",
      render: (text: string) => (
        <Tag
          color={
            text?.toLowerCase().includes("baru")
              ? "green"
              : text
              ? "gold"
              : "default"
          }
          style={{ fontSize: 15 }}
        >
          {text || "-"}
        </Tag>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>File</span>,
      dataIndex: "file_path",
      key: "file_path",
      align: "center",
      render: (path: string | null) => {
        if (!path) return <span style={{ fontSize: 16 }}>-</span>;

        const lower = String(path).toLowerCase();
        const isPdf = lower.endsWith(".pdf");
        const isImage =
          lower.endsWith(".png") ||
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg");

        return isPdf ? (
          <Tooltip title="Lihat PDF">
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaFilePdf size={20} color="#dc2626" />
            </a>
          </Tooltip>
        ) : isImage ? (
          <Tooltip title="Lihat Gambar">
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaFileImage size={20} color="#2563eb" />
            </a>
          </Tooltip>
        ) : (
          <span style={{ fontSize: 16 }}>-</span>
        );
      },
    },
    {
      key: "uuid",
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>AKSI</span>,
      dataIndex: "uuid",
      align: "center",
      render: (value: string, record: ArchiveItem) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<MdEdit size={18} />}
              onClick={() => navigate(`/admin/arsip/edit/${value}`)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
          <Popconfirm
            title={`Yakin menghapus data "${record.full_name || "-"}"?`}
            onConfirm={() => onDelete(value)}
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
};
