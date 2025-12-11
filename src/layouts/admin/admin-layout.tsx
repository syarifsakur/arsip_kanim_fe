// ...existing code...
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Breadcrumb, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  menuItems,
  removeItem,
  showNotification,
  showNotificationError,
} from "../../utils";
import { logout } from "../../utils/apis";
import logo from "../../assets/logo-imigrasi.png";
import kantor from "../../assets/logo-imigrasi.png";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("1");

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  // Auto select menu berdasarkan route
  useEffect(() => {
    const currentPath = location.pathname;
    const foundItem = menuItems
      .flatMap((section: any) => section.items)
      .find((item: any) => currentPath.startsWith(item.path));

    if (foundItem) setSelectedKey(foundItem.key);
  }, [location.pathname]);

  const handleMenuClick = (path: string, key: string) => {
    setSelectedKey(key);
    navigate(path);
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: "Konfirmasi Logout",
      content: "Apakah Anda yakin ingin Logout?",
      okText: "Ya, Logout",
      cancelText: "Batal",
      okType: "danger",
      centered: true,
      onOk: async () => {
        try {
          await logout();
          removeItem("profile");
          showNotification("Logout berhasil!");
          navigate("/", { replace: true });
        } catch (err) {
          showNotificationError("Gagal logout, coba lagi.");
        }
      },
    });
  };

  const getBreadcrumbItems = () => {
    const currentPath = location.pathname;
    const breadcrumbItems: any[] = [
      { title: <HomeOutlined />, href: "/admin" },
    ];

    const foundItem = menuItems
      .flatMap((section: any) => section.items)
      .find((item: any) => currentPath.startsWith(item.path));

    if (foundItem) {
      breadcrumbItems.push({ title: foundItem.label });

      const subPath = currentPath
        .replace(foundItem.path, "")
        .split("/")
        .filter(Boolean);

      subPath.forEach((part) => {
        breadcrumbItems.push({
          title: part.charAt(0).toUpperCase() + part.slice(1),
        });
      });
    }

    return breadcrumbItems;
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* ------------- SIDEBAR ------------- */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          height: "100vh",
          overflow: "auto",
          backgroundColor: "", // ORANGE
        }}
      >
        {/* LOGO */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 16px",
            background: "",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              width: collapsed ? 40 : 56,
              height: collapsed ? 40 : 56,
              objectFit: "contain",
            }}
          />
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>
                Admin
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                Sistem Inventaris
              </div>
            </div>
          )}
        </div>

        {/* MENU LIST */}
        <Menu
          theme="dark" // <— tambahkan ini
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            backgroundColor: "#0a1a2f",
            borderRight: "none",
          }}
        >
          {menuItems.map((section: any) => (
            <React.Fragment key={section.title}>
              <Menu.ItemGroup
                title={<span style={{ opacity: 0.9 }}>{section.title}</span>}
              >
                {section.items.map((item: any) => {
                  const active = selectedKey === item.key;

                  return (
                    <Menu.Item
                      key={item.key}
                      onClick={() => handleMenuClick(item.path, item.key)}
                      icon={React.cloneElement(item.icon, {
                        // theme="dark" sudah bikin icon putih,
                        // tapi kalau mau paksa:
                        style: { color: "#ffffff" },
                      })}
                      style={{
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? "#d87800" : "transparent",
                      }}
                    >
                      {item.label}
                    </Menu.Item>
                  );
                })}
              </Menu.ItemGroup>
            </React.Fragment>
          ))}

          {/* LOGOUT */}
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={confirmLogout}
            style={{
              fontWeight: 600,
              marginTop: 10,
            }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      {/* ------------- MAIN CONTENT ------------- */}
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: "#ffffff",
            height: 64,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ color: "black" }} />
              ) : (
                <MenuFoldOutlined style={{ color: "black" }} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 20,
              width: 48,
              height: 48,
            }}
          />
        </Header>

        <Content
          style={{
            height: "calc(100vh - 64px)",
            overflow: "auto",
            margin: "24px 16px",
            padding: 24,
            backgroundImage: `url(${kantor})`,
            backgroundSize: "cover",
            backgroundPosition: "center 10px",
            borderRadius: borderRadiusLG,
            position: "relative",
          }}
        >
          {/* readable panel di atas gambar */}
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              padding: 20,
              borderRadius: 12,
              minHeight: "calc(100% - 40px)",
              boxShadow: "0 6px 20px rgba(2,6,23,0.06)",
            }}
          >
            <Breadcrumb items={getBreadcrumbItems()} />
            <div style={{ marginTop: 16 }}>{children}</div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
