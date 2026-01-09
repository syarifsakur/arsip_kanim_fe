import React, { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Space,
  DatePicker,
  Grid,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import type { BorrowingItem } from "../../../types/borrowing";

const { useBreakpoint } = Grid;

type BorrowingPayload = {
  id_archive: string;
  borrowers_name: string;
  division?: string;
  loan_date?: string;
  return_date?: string;
};

interface BorrowingFormProps {
  initialValues?: Partial<BorrowingItem> | null;
  archives?: Array<{ uuid: string; application_number: string }>;
  onSubmit: (data: BorrowingPayload) => void;
  mode: "create" | "edit";
  isLoading?: boolean;
}

const BorrowingForm: React.FC<BorrowingFormProps> = ({
  initialValues,
  archives = [],
  onSubmit,
  mode,
  isLoading = false,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  useEffect(() => {
    if (!initialValues) return;

    form.setFieldsValue({
      id_archive: initialValues.id_archive,
      borrowers_name: initialValues.borrowers_name,
      division: initialValues.division,
      loan_date: initialValues.loan_date
        ? dayjs(initialValues.loan_date)
        : null,
      return_date: initialValues.return_date
        ? dayjs(initialValues.return_date)
        : null,
    });
  }, [initialValues, form]);

  const handleFinish = (
    values: BorrowingPayload & {
      loan_date?: dayjs.Dayjs;
      return_date?: dayjs.Dayjs;
    }
  ) => {
    const data = {
      id_archive: values.id_archive,
      borrowers_name: values.borrowers_name,
      division: values.division || "",
      loan_date: values.loan_date
        ? dayjs(values.loan_date).format("YYYY-MM-DD")
        : "",
      return_date: values.return_date
        ? dayjs(values.return_date).format("YYYY-MM-DD")
        : "",
    };
    onSubmit(data);
  };

  return (
    <Card title={mode === "edit" ? "Edit Borrowing" : "Tambah Borrowing"}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Nomor Arsip"
          name="id_archive"
          rules={[
            {
              required: true,
              message: "Pilih nomor arsip!",
            },
          ]}
        >
          <Select
            placeholder="Pilih nomor arsip"
            optionLabelProp="label"
            disabled={mode === "edit"}
            style={{ width: "100%" }}
          >
            {archives.map((archive) => (
              <Select.Option
                key={archive.uuid}
                value={archive.uuid}
                label={archive.application_number}
              >
                {archive.application_number}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Nama Peminjam"
          name="borrowers_name"
          rules={[
            {
              required: true,
              message: "Nama peminjam tidak boleh kosong!",
            },
          ]}
        >
          <Input placeholder="Masukkan nama peminjam" />
        </Form.Item>

        <Form.Item label="Divisi" name="division">
          <Input placeholder="Masukkan divisi" />
        </Form.Item>

        <Form.Item
          label="Tanggal Peminjaman"
          name="loan_date"
          rules={[
            {
              required: true,
              message: "Tanggal peminjaman harus dipilih!",
            },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
            placeholder="Pilih tanggal peminjaman"
          />
        </Form.Item>

        <Form.Item label="Tanggal Pengembalian" name="return_date">
          <DatePicker
            style={{ width: "100%" }}
            format="DD-MM-YYYY"
            placeholder="Pilih tanggal pengembalian"
          />
        </Form.Item>

        <Space
          className="w-full"
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ justifyContent: "space-between" }}
        >
          <Button onClick={() => navigate("/admin/borrowing")} block={isMobile}>
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

export default BorrowingForm;
