import {
  DashboardOutlined,
  ReadOutlined,
  AuditOutlined,
  HddOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const getMenuItemsByRole = (role: string) => {
  if (role?.toLowerCase() === "superadmin") {
    return [
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
            label: "Arsip",
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
          {
            key: "5",
            icon: <UserOutlined />,
            label: "Kelola User",
            path: "/admin/manage-users",
          },
        ],
      },
    ];
  }

  if (role?.toLowerCase() === "admin") {
    return [
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
            label: "Arsip",
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
        ],
      },
    ];
  }
  if (role?.toLowerCase() === "user") {
    return [
      {
        title: "Menu",
        items: [
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            path: "/user/dashboard",
          },
          {
            key: "2",
            icon: <AuditOutlined />,
            label: "Peminjaman",
            path: "/user/borrowing",
          },
          {
            key: "3",
            icon: <ReadOutlined />,
            label: "Riwayat",
            path: "/user/riwayat",
          },
        ],
      },
    ];
  }
  return [
    {
      title: "Menu",
      items: [
        {
          key: "1",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          path: "/admin/dashboard",
        },
      ],
    },
  ];
};

// Menu items default (untuk backward compatibility)
export const menuItems = getMenuItemsByRole("admin");
