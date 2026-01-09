import React, { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Card,
  Space,
  DatePicker,
  Grid,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { useBreakpoint } = Grid;

interface ArchiveFormProps {
  initialValues?: any;
  onSubmit: (formData: FormData) => void;
  mode: "create" | "edit";
}

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".pdf"];
const ALLOWED_MIME = ["image/png", "image/jpeg", "application/pdf"];

const getExt = (name: string) => {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
};

const ArchiveForm: React.FC<ArchiveFormProps> = ({
  initialValues,
  onSubmit,
  mode,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  useEffect(() => {
    if (!initialValues) return;

    const fileList: UploadFile[] = initialValues.file_path
      ? [
          {
            uid: "-1",
            name: initialValues.file || "file",
            status: "done",
            url: initialValues.file_path,
          } as UploadFile,
        ]
      : [];

    form.setFieldsValue({
      application_number: initialValues.application_number,
      application_date: initialValues.application_date
        ? dayjs(initialValues.application_date)
        : null,
      application_type: initialValues.application_type,
      passport_type: initialValues.passport_type,
      passport_purpose: initialValues.passport_purpose,
      passport_number: initialValues.passport_number,
      service_method: initialValues.service_method,
      full_name: initialValues.full_name,
      date_of_birth: initialValues.date_of_birth
        ? dayjs(initialValues.date_of_birth)
        : null,
      gender: initialValues.gender,
      passport_registration_number: initialValues.passport_registration_number,
      issue_date: initialValues.issue_date
        ? dayjs(initialValues.issue_date)
        : null,
      expiration_date: initialValues.expiration_date
        ? dayjs(initialValues.expiration_date)
        : null,
      province: initialValues.province,
      district_city: initialValues.district_city,
      sub_district: initialValues.sub_district,
      file: fileList,
    });
  }, [initialValues, form]);

  const validateUpload = (_: any, fileList: UploadFile[]) => {
    // CREATE: file wajib
    if (mode === "create" && (!fileList || fileList.length === 0)) {
      return Promise.reject(new Error("File wajib diupload!"));
    }

    if (!fileList || fileList.length === 0) return Promise.resolve();

    // jika edit dan file lama (punya url, tanpa originFileObj), biarkan
    const f = fileList[0];
    const raw = f.originFileObj as File | undefined;
    if (!raw) return Promise.resolve();

    const ext = getExt(raw.name);
    if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(raw.type)) {
      return Promise.reject(
        new Error("Format file tidak didukung. Gunakan PDF / PNG / JPG / JPEG.")
      );
    }
    if (raw.size > MAX_FILE_SIZE) {
      return Promise.reject(
        new Error("Ukuran file terlalu besar (maks 30MB).")
      );
    }

    return Promise.resolve();
  };

  const handleFinish = (values: any) => {
    const formData = new FormData();

    // ✅ sesuai backend
    formData.append("application_number", values.application_number || "");
    formData.append(
      "application_date",
      values.application_date
        ? dayjs(values.application_date).format("YYYY-MM-DD")
        : ""
    );
    formData.append("application_type", values.application_type || "");
    formData.append("passport_type", values.passport_type || "");
    formData.append("passport_purpose", values.passport_purpose || "");
    formData.append("passport_number", values.passport_number || "");
    formData.append("service_method", values.service_method || "");
    formData.append("full_name", values.full_name || "");
    formData.append(
      "date_of_birth",
      values.date_of_birth
        ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
        : ""
    );
    formData.append("gender", values.gender || "");
    formData.append(
      "passport_registration_number",
      values.passport_registration_number || ""
    );
    formData.append(
      "issue_date",
      values.issue_date ? dayjs(values.issue_date).format("YYYY-MM-DD") : ""
    );
    formData.append(
      "expiration_date",
      values.expiration_date
        ? dayjs(values.expiration_date).format("YYYY-MM-DD")
        : ""
    );
    formData.append("province", values.province || "");
    formData.append("district_city", values.district_city || "");
    formData.append("sub_district", values.sub_district || "");

    // ✅ file: create wajib; edit optional (kalau ada file baru, kirim)
    const fileList: UploadFile[] = values.file || [];
    if (fileList[0]?.originFileObj) {
      formData.append("file", fileList[0].originFileObj as File);
    }

    onSubmit(formData);
  };

  return (
    <Card title={mode === "edit" ? "Edit Archive" : "Tambah Archive"}>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          gender: undefined,
          service_method: undefined,
        }}
      >
        {/* ====== SECTION: PERMOHONAN ====== */}
        <Form.Item
          label="Nomor Permohonan"
          name="application_number"
          rules={[{ required: true, message: "Nomor permohonan wajib diisi" }]}
        >
          <Input placeholder="Masukkan nomor permohonan" />
        </Form.Item>

        <Form.Item label="Tanggal Permohonan" name="application_date">
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item label="Jenis Permohonan" name="application_type">
          <Select placeholder="Pilih jenis permohonan">
            <Select.Option value="BARU">BARU</Select.Option>
            <Select.Option value="GANTI (PENUH / HALAMAN PENUH)">
              GANTI (PENUH / HALAMAN PENUH)
            </Select.Option>
            <Select.Option value="GANTI (HABIS MASA BERLAKU)">
              GANTI (HABIS MASA BERLAKU)
            </Select.Option>
            <Select.Option value="GANTI (HILANG)">GANTI (HILANG)</Select.Option>
          </Select>
        </Form.Item>

        {/* ====== SECTION: PASPOR ====== */}
        <Form.Item
          label="Tipe Paspor"
          name="passport_type"
          rules={[{ required: true, message: "Tipe paspor wajib diisi" }]}
        >
          <Select placeholder="Pilih tipe paspor">
            <Select.Option value="paspor biasa elektronik laminasi 5 tahun">
              paspor biasa elektronik laminasi 5 tahun
            </Select.Option>
            <Select.Option value="paspor biasa elektronik laminasi 10 tahun">
              paspor biasa elektronik laminasi 10 tahun
            </Select.Option>
            <Select.Option value="PASPOR BIASA 24 H">
              PASPOR BIASA 24 H
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Keperluan Paspor" name="passport_purpose">
          <Input placeholder="Masukkan keperluan paspor" />
        </Form.Item>

        <Form.Item label="Nomor Paspor" name="passport_number">
          <Input placeholder="Masukkan nomor paspor" />
        </Form.Item>

        <Form.Item
          label="Metode Layanan"
          name="service_method"
          rules={[{ required: true, message: "Metode layanan wajib dipilih" }]}
        >
          <Select placeholder="Pilih metode layanan">
            <Select.Option value="layanan online">layanan online</Select.Option>
            <Select.Option value="layanan percepatan">
              layanan percepatan
            </Select.Option>
          </Select>
        </Form.Item>

        {/* ====== SECTION: IDENTITAS ====== */}
        <Form.Item
          label="Nama Lengkap"
          name="full_name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input placeholder="Masukkan nama lengkap" />
        </Form.Item>

        <Form.Item
          label="Tanggal Lahir"
          name="date_of_birth"
          rules={[{ required: true, message: "Tanggal lahir wajib diisi" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item
          label="Jenis Kelamin"
          name="gender"
          rules={[{ required: true, message: "Jenis kelamin wajib dipilih" }]}
        >
          <Select placeholder="Pilih jenis kelamin">
            <Select.Option value="L">Laki-laki</Select.Option>
            <Select.Option value="P">Perempuan</Select.Option>
          </Select>
        </Form.Item>

        {/* ====== SECTION: REGISTRASI ====== */}
        <Form.Item
          label="Nomor Registrasi Paspor"
          name="passport_registration_number"
          rules={[{ required: true, message: "Nomor registrasi wajib diisi" }]}
        >
          <Input placeholder="Masukkan nomor registrasi paspor" />
        </Form.Item>

        <Form.Item
          label="Tanggal Terbit"
          name="issue_date"
          rules={[{ required: true, message: "Tanggal terbit wajib diisi" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item
          label="Tanggal Expired"
          name="expiration_date"
          rules={[{ required: true, message: "Tanggal expired wajib diisi" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        {/* ====== SECTION: ALAMAT ====== */}
        <Form.Item
          label="Provinsi"
          name="province"
          rules={[{ required: true, message: "Provinsi wajib diisi" }]}
        >
          <Input placeholder="Masukkan provinsi" />
        </Form.Item>

        <Form.Item
          label="Kab/Kota"
          name="district_city"
          rules={[{ required: true, message: "Kab/Kota wajib diisi" }]}
        >
          <Input placeholder="Masukkan kab/kota" />
        </Form.Item>

        <Form.Item
          label="Kecamatan"
          name="sub_district"
          rules={[{ required: true, message: "Kecamatan wajib diisi" }]}
        >
          <Input placeholder="Masukkan kecamatan" />
        </Form.Item>

        {/* ====== UPLOAD FILE ====== */}
        <Form.Item
          label={`Upload File (PDF / Gambar)${mode === "create" ? " *" : ""}`}
          name="file"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[{ validator: validateUpload }]}
          extra="Format: PDF/PNG/JPG/JPEG. Maks: 30MB."
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept=".pdf,.png,.jpg,.jpeg"
          >
            <Button icon={<UploadOutlined />} block={isMobile}>
              Pilih File
            </Button>
          </Upload>
        </Form.Item>

        <Space
          className="w-full"
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ justifyContent: "space-between" }}
        >
          <Button onClick={() => navigate("/admin/arsip")} block={isMobile}>
            Kembali
          </Button>
          <Button type="primary" htmlType="submit" block={isMobile}>
            {mode === "edit" ? "Update" : "Simpan"}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ArchiveForm;
