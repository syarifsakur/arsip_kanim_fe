// ...existing code...
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Menu,
  theme,
  Breadcrumb,
  Modal,
  Avatar,
  Grid,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  menuItems,
  getMenuItemsByRole,
  removeItem,
  showNotification,
  showNotificationError,
  getItem,
} from "../../utils";
import { logout } from "../../utils/apis";
import logo from "../../assets/logo-imigrasi-removebg-preview.png";
import kantor from "../../assets/logo-imigrasi.png";

const { Header, Sider, Content, Footer } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("1");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentMenuItems, setCurrentMenuItems] = useState<any>(menuItems);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const profile = getItem("profile");
    setUserProfile(profile);

    const role = profile?.data?.role;

    const roleBasedMenus = getMenuItemsByRole(role);
    console.log(
      "Menu items for role '" + role + "':",
      roleBasedMenus.flatMap((s: any) => s.items).map((i: any) => i.label),
    );

    setCurrentMenuItems(roleBasedMenus);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const foundItem = currentMenuItems
      .flatMap((section: any) => section.items)
      .find((item: any) => currentPath.startsWith(item.path));

    if (foundItem) setSelectedKey(foundItem.key);
  }, [location.pathname, currentMenuItems]);

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

    const foundItem = currentMenuItems
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
        breakpoint="md"
        collapsedWidth={isMobile ? 0 : 70}
        width={isMobile ? 180 : 220}
        style={{
          height: "100vh",
          overflow: "auto",
          backgroundColor: "#0a1a2f",
          position: isMobile ? "fixed" : "static",
          left: 0,
          top: 0,
          zIndex: isMobile ? 99 : "auto",
          boxShadow:
            isMobile && !collapsed ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
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
            <div
              style={{
                marginLeft: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                SI-DEI
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: "rgba(255,255,255,0.85)",
                  lineHeight: 1.3,
                  marginTop: 2,
                }}
              >
                Sistem Informasi Data Elektronik Imigrasi
              </div>
            </div>
          )}
        </div>

        {/* MENU LIST */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            backgroundColor: "#0a1a2f",
            borderRight: "none",
            padding: "12px 0",
          }}
        >
          {currentMenuItems.map((section: any, index: number) => (
            <React.Fragment key={section.title}>
              <Menu.ItemGroup
                title={
                  <span
                    style={{
                      opacity: 0.7,
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {section.title}
                  </span>
                }
              >
                {section.items.map((item: any) => {
                  const active = selectedKey === item.key;

                  return (
                    <Menu.Item
                      key={item.key}
                      onClick={() => handleMenuClick(item.path, item.key)}
                      icon={React.cloneElement(item.icon, {
                        style: {
                          color: active ? "#ffa940" : "rgba(255,255,255,0.85)",
                          fontSize: "16px",
                        },
                      })}
                      style={{
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active
                          ? "rgba(255,164,64,0.15)"
                          : "transparent",
                        color: active ? "#ffa940" : "rgba(255,255,255,0.85)",
                        borderRight: active ? "3px solid #ffa940" : "none",
                        margin: "4px 8px",
                        borderRadius: "6px 0 0 6px",
                        transition: "all 0.3s ease, background-color 0.3s ease",
                      }}
                    >
                      <span style={{ marginLeft: "8px" }}>{item.label}</span>
                    </Menu.Item>
                  );
                })}
              </Menu.ItemGroup>
              {index < currentMenuItems.length - 1 && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    margin: "8px 16px",
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {/* LOGOUT */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              margin: "12px 0",
            }}
          />
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined style={{ fontSize: "16px" }} />}
            onClick={confirmLogout}
            style={{
              fontWeight: 600,
              margin: "8px 8px",
              borderRadius: "6px",
              color: "rgba(255,255,255,0.85)",
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ marginLeft: "8px" }}>Logout</span>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* ------------- MAIN CONTENT ------------- */}
      <Layout>
        <Header
          style={{
            padding: "0 12px",
            background: "#ffffff",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            overflow: "hidden",
            gap: "8px",
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
              fontSize: isMobile ? 16 : 18,
              width: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              minWidth: isMobile ? 36 : 44,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          />

          {/* Debug info - Role & User */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 6 : 12,
              fontSize: isMobile ? 10 : 12,
              flexWrap: isMobile ? "wrap" : "nowrap",
              justifyContent: "flex-end",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {!isMobile && (
              <>
                <span style={{ color: "#666", whiteSpace: "nowrap" }}>
                  <strong>Role:</strong> {userProfile?.data?.role || "unknown"}
                </span>
                <span style={{ color: "#999" }}>|</span>
              </>
            )}
            <span
              style={{
                color: "#666",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <strong>{isMobile ? "U:" : "User:"}</strong>{" "}
              {userProfile?.data?.name || userProfile?.data?.username || "N/A"}
            </span>
          </div>
        </Header>

        <Content
          style={{
            height: "calc(100vh - 64px)",
            overflow: "auto",
            margin: isMobile ? "12px" : "16px 20px",
            padding: isMobile ? 12 : 16,
            borderRadius: borderRadiusLG,
            position: "relative",
          }}
        >
          {/* readable panel di atas gambar */}
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              padding: isMobile ? 12 : 16,
              borderRadius: 12,
              minHeight: "calc(100% - 40px)",
              boxShadow: "0 6px 20px rgba(2,6,23,0.06)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Breadcrumb items={getBreadcrumbItems()} />
            <div style={{ marginTop: 16, flex: 1, minHeight: 0 }}>
              {children}
            </div>
          </div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "12px 16px" }}>
          {" "}
          Sistem Inventaris &copy; 2024 Imigrasi Kelas I TPI Palu
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
