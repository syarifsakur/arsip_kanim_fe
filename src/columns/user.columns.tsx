import { Button, Tooltip, Popconfirm, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MdDelete, MdEdit } from "react-icons/md";
import type { User } from "../types/user";

type Props = {
  current: number;
  pageSize: number;
  onDelete: (uuid: string) => void;
  onEdit: (user: User) => void;
};

export const userColumns = ({
  current,
  pageSize,
  onDelete,
  onEdit,
}: Props): ColumnsType<User> => {
  return [
    {
      key: "no",
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>NO.</span>,
      align: "center",
      width: 70,
      render: (_: User, __: User, index: number) => (
        <span style={{ fontSize: 16 }}>
          {(current - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Username</span>,
      dataIndex: "username",
      key: "username",
      render: (text: string) => (
        <span style={{ fontSize: 16, fontWeight: 500 }}>{text || "-"}</span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Divisi</span>,
      dataIndex: "division",
      key: "division",
      align: "center",
      render: (_: string, record: User) => (
        <span style={{ fontSize: 16 }}>
          {record.division || record.divisi || "-"}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>Role</span>,
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: string) => {
        const getRoleConfig = (roleValue: string) => {
          switch (roleValue?.toLowerCase()) {
            case "superadmin":
              return { color: "red", label: "Super Admin" };
            case "admin":
              return { color: "orange", label: "Admin" };
            case "user":
              return { color: "blue", label: "User" };
            default:
              return { color: "default", label: roleValue };
          }
        };

        const config = getRoleConfig(role);
        return (
          <Tag color={config.color} style={{ fontSize: 14, fontWeight: 600 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: <span style={{ fontSize: 16, fontWeight: 600 }}>AKSI</span>,
      key: "action",
      align: "center",
      width: 150,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button
              type="primary"
              icon={<MdEdit />}
              size="middle"
              onClick={() => onEdit(record)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
          <Tooltip title="Hapus User">
            <Popconfirm
              title="Hapus User?"
              description={`Apakah Anda yakin ingin menghapus user "${record.username}"?`}
              onConfirm={() => onDelete(record.uuid)}
              okText="Ya"
              cancelText="Tidak"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="primary"
                danger
                icon={<MdDelete />}
                size="middle"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
};
