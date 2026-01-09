import React, { useEffect, useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Card, Descriptions, Button, Space, Spin, Tag } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { fetchArchiveById } from "../../../utils/apis";
import type { ArchiveItem } from "../../../types/archive";

const ArchiveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ArchiveItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetchArchiveById(id);
        const item: ArchiveItem =
          res?.data?.data ?? res?.data ?? res?.data?.response;
        setData(item || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (v?: string | null) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleDateString("id-ID");
    } catch {
      return v;
    }
  };

  const renderFile = () => {
    const path = data?.file_path;
    if (!path) return <span>-</span>;
    const lower = path.toLowerCase();
    const isPdf = lower.endsWith(".pdf");
    if (isPdf) {
      return (
        <a href={path} target="_blank" rel="noopener noreferrer">
          Lihat Dokumen (PDF)
        </a>
      );
    }
    return (
      <a href={path} target="_blank" rel="noopener noreferrer">
        Lihat Gambar
      </a>
    );
  };

  return (
    <AdminLayout>
      <Card
        title="Detail Arsip"
        extra={
          <Space>
            <Button onClick={() => navigate("/admin/arsip")}>Kembali</Button>
            {data?.uuid && (
              <Button
                type="primary"
                onClick={() => navigate(`/admin/arsip/edit/${data.uuid}`)}
              >
                Edit
              </Button>
            )}
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : !data ? (
          <div>Tidak ada data.</div>
        ) : (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="No. Permohonan">
              {data.application_number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="No Arsip">
              {data.no_archive || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tgl Permohonan">
              {formatDate(data.application_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis Permohonan">
              {data.application_type ? (
                <Tag
                  color={
                    data.application_type.toLowerCase().includes("baru")
                      ? "green"
                      : "gold"
                  }
                >
                  {data.application_type}
                </Tag>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tipe Paspor">
              {data.passport_type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Keperluan Paspor">
              {data.passport_purpose || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor Paspor">
              {data.passport_number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Metode Layanan">
              {data.service_method || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Lengkap">
              {data.full_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Lahir">
              {formatDate(data.date_of_birth)}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis Kelamin">
              {data.gender || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="No. Registrasi Paspor">
              {data.passport_registration_number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Terbit">
              {formatDate(data.issue_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Expired">
              {formatDate(data.expiration_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Provinsi">
              {data.province || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Kab/Kota">
              {data.district_city || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Kecamatan">
              {data.sub_district || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="File">{renderFile()}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </AdminLayout>
  );
};

export default ArchiveDetail;
