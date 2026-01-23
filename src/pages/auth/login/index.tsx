import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import bg from "../../../assets/kantor kanim.webp";
import logo from "../../../assets/logo-imigrasi.png";
import { login } from "../../../utils/apis";
import { setItem } from "../../../utils/storages";
import { jwtDecode } from "jwt-decode";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await login(values);
      const data = res?.data;

      if (!data?.token) throw new Error("Token tidak ditemukan dari server.");

      const decoded = jwtDecode(data.token) as any;

      // Debug: lihat isi JWT token
      console.log("JWT Decoded:", decoded);
      console.log("Response data:", data);
      console.log("dataForClient:", data?.dataForClient);

      setItem({
        key: "profile",
        value: {
          token: data.token,
          data: {
            ...(data?.dataForClient || data?.user || data?.data || {}),
            role:
              data?.dataForClient?.role ||
              data?.user?.role ||
              data?.data?.role ||
              data?.role ||
              decoded?.role ||
              decoded?.userRole ||
              decoded?.permissions?.[0] ||
              "user",
            // ID dari dataForClient
            id:
              data?.dataForClient?.userId ||
              data?.user?.id ||
              data?.data?.id ||
              data?.id ||
              decoded?.userId ||
              decoded?.sub,
            name:
              data?.dataForClient?.name ||
              data?.user?.name ||
              data?.data?.name ||
              data?.name ||
              decoded?.name,
            username:
              data?.dataForClient?.username ||
              data?.user?.username ||
              data?.data?.username ||
              data?.username ||
              decoded?.username,
          },
          expire: decoded?.exp,
        },
      });

      // Tentukan role untuk redirect
      const userRole =
        data?.dataForClient?.role ||
        data?.user?.role ||
        data?.data?.role ||
        "user";
      const redirectPath =
        userRole.toLowerCase() === "user" ? "/user" : "/admin";

      console.log("=== LOGIN SUCCESS ===");
      console.log("Role:", userRole);
      console.log("Redirect to:", redirectPath);

      message.success("Login berhasil");

      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      message.error(
        err.response?.data?.message || "Login gagal, periksa kredensial Anda",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      <Card
        style={{
          width: 420,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 15px 40px rgba(0,0,0,0.35)",
          border: "none",
          zIndex: 1,
          padding: 0,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: "#043666",
            padding: "40px 24px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ width: 55, height: 55, objectFit: "contain" }}
            />
            Arsiparis Kanim kelas I TPI Palu
          </div>
        </div>

        <div
          style={{
            padding: "32px",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 600 }}>Username</span>}
              rules={[{ required: true, message: "Masukkan username!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Masukkan username"
                size="large"
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 600 }}>Password</span>}
              rules={[{ required: true, message: "Masukkan password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Masukkan password"
                size="large"
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 16,
                  backgroundColor: "#043666",
                  borderColor: "#043666",
                }}
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
