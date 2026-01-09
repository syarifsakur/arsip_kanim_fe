import {
  DashboardOutlined,
  ReadOutlined,
  AuditOutlined,
  HddOutlined,
} from "@ant-design/icons";

export const menuItems = [
  {
    title: "Menu",
    items: [
      {
        key: "1",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        path: "/admin/dashboard",
      },
      {
        key: "2",
        icon: <HddOutlined />,
        label: "arsip",
        path: "/admin/arsip",
      },
      {
        key: "3",
        icon: <AuditOutlined />,
        label: "Peminjaman",
        path: "/admin/borrowing",
      },
      {
        key: "4",
        icon: <ReadOutlined />,
        label: "Riwayat",
        path: "/admin/riwayat",
      },
      // {
      //   key: "5",
      //   icon: <SettingOutlined />,
      //   label: "Change Password",
      //   path: "/admin/change-password",
      // },
    ],
  },
];
