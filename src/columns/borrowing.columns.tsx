import { Button, Tooltip, Popconfirm, Tag, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MdDelete, MdEdit } from "react-icons/md";
import type { BorrowingItem } from "../types/borrowing";

type Props = {
  current: number;
  pageSize: number;
  onDelete: (uuid: string) => void;
  onEdit: (uuid: string) => void;
  onStatusChange?: (uuid: string, status: string) => void;
};

export const borrowingColumns = ({
  current,
  pageSize,
  onDelete,
  onEdit,
  onStatusChange,
}: Props): ColumnsType<BorrowingItem> => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  return [
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
                label: "Dipinjam",
                value: "dipinjam",
              },
              {
                label: "Dikembalikan",
                value: "dikembalikan",
              },
            ]}
          />
        ) : (
          <Tag color={status === "dikembalikan" ? "green" : "red"}>
            {status === "dikembalikan" ? "Dikembalikan" : "Dipinjam"}
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
};
