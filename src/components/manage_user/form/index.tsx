import React, { useEffect, useMemo } from "react";
import { Form, Input, Button, Select, Card, Space, Grid } from "antd";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types";

const { useBreakpoint } = Grid;

type UserFormPayload = {
  username: string;
  password?: string;
  role: string;
  division: string;
};

interface UserFormProps {
  initialValues?: Partial<User> | null;
  onSubmit: (data: UserFormPayload) => void;
  mode: "create" | "edit";
  isLoading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  mode,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  // Normalize initial data so form fields always get the expected shape
  const normalizedInitial =
    mode === "edit" && initialValues
      ? {
          username: initialValues.username,
          role: initialValues.role,
          division:
            (initialValues as any)?.division !== undefined
              ? (initialValues as any)?.division
              : initialValues.divisi,
        }
      : undefined;

  useEffect(() => {
    if (initialValues && mode === "edit") {
      form.setFieldsValue({
        username: initialValues.username,
        role: initialValues.role,
        // Backends sometimes send `division`, existing data used `divisi`
        division: (initialValues as any)?.division || initialValues.divisi,
      });
    }
  }, [initialValues, form, mode]);

  const handleSubmit = async (values: any) => {
    const payload: UserFormPayload = {
      username: values.username,
      role: values.role,
      division: values.division,
    };

    if (mode === "create" && values.password) {
      payload.password = values.password;
    }

    onSubmit(payload);
  };

  return (
    <Card title={mode === "edit" ? "Edit User" : "Tambah User"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        initialValues={normalizedInitial}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Username harus diisi!" }]}
        >
          <Input placeholder="Masukkan username" />
        </Form.Item>

        {mode === "create" && (
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password harus diisi!" },
              {
                validator: (_, value) => {
                  if (!value || value.length >= 8) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Password minimal 8 karakter!"),
                  );
                },
              },
            ]}
          >
            <Input.Password placeholder="Masukkan password (minimal 8 karakter)" />
          </Form.Item>
        )}

        <Form.Item
          label="Divisi"
          name="division"
          rules={[{ required: true, message: "Divisi harus diisi!" }]}
        >
          <Input placeholder="Masukkan divisi" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role harus dipilih!" }]}
        >
          <Select
            placeholder="Pilih role"
            options={[
              { label: "Super Admin", value: "superadmin" },
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ]}
          />
        </Form.Item>

        <Space
          className="w-full"
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ justifyContent: "space-between" }}
        >
          <Button
            onClick={() => navigate("/admin/manage-users")}
            block={isMobile}
          >
            Kembali
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            block={isMobile}
            loading={isLoading}
          >
            {mode === "edit" ? "Update" : "Simpan"}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default UserForm;
