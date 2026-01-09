import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Table, Button, Grid, Space, Input, Upload, Select } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { archiveColumns } from "../../../columns/archive.columns";
import type { ArchiveItem } from "../../../types/archive";
import { showNotification, showNotificationError } from "../../../utils";
import {
  deleteArchive,
  fetchArchive,
  importDataArchive,
} from "../../../utils/apis";

const { useBreakpoint } = Grid;

const ArchiveDefault: React.FC = () => {
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [filteredArchive, setFilteredArchive] = useState<ArchiveItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [year, setYear] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        archive
          .map((a) =>
            a.date_of_birth ? String(a.date_of_birth).slice(0, 4) : ""
          )
          .filter((y) => y && /^\d{4}$/.test(y))
      )
    ).sort((a, b) => Number(b) - Number(a));
    return years.map((y) => ({ label: y, value: y }));
  }, [archive]);

  const loadArchive = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetchArchive();
      const list: ArchiveItem[] =
        response?.data?.data ?? response?.data?.response ?? [];

      // DEBUG: log response shape to help diagnose missing fields
      // console.log('fetchArchive response', response?.data);

      // normalize possible alternate field names from backend
      const normalized = list.map((item: any) => ({
        ...item,
        passport_purpose:
          item.passport_purpose ??
          item.passportPurpose ??
          item.tujuan ??
          item.purpose ??
          item.keperluan ??
          item.keperluan_paspor ??
          item.tujuan_paspor ??
          null,
        application_type:
          item.application_type ??
          item.applicationType ??
          item.jenis_permohonan ??
          item.jenisPermohonan ??
          item.type ??
          null,
      }));

      const cleaned = normalized.filter(
        (item) => item.application_number !== "TOTAL DATA"
      );

      setArchive(cleaned);

      // initial filter using query + year
      const q = query.toLowerCase();
      const filtered = cleaned.filter((item) => {
        const matchQuery = String(item.application_number || "")
          .toLowerCase()
          .includes(q);
        const dob = item.date_of_birth || "";
        const dobYear = dob ? String(dob).slice(0, 4) : "";
        const matchYear = !year || dobYear === year;
        return matchQuery && matchYear;
      });
      setFilteredArchive(filtered);
    } catch (error) {
      console.error("Error fetching archive:", error);
      showNotificationError("Gagal mengambil data archive!");
    } finally {
      setIsLoading(false);
    }
  }, [query, year]);

  // initial load
  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  // responsive page size
  useEffect(() => {
    const nextSize = isMobile ? 5 : 10;
    setPagination((p) =>
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 }
    );
  }, [isMobile]);

  // filter archive based on query + year
  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    const q = query.toLowerCase();
    const filtered = archive.filter((item) => {
      const matchQuery = String(item.application_number || "")
        .toLowerCase()
        .includes(q);
      const dob = item.date_of_birth || "";
      const dobYear = dob ? String(dob).slice(0, 4) : "";
      const matchYear = !year || dobYear === year;
      return matchQuery && matchYear;
    });
    setFilteredArchive(filtered);
  }, [query, year, archive]);

  const handleDelete = async (uuid: string) => {
    try {
      await deleteArchive(uuid);
      showNotification("Berhasil menghapus data archive!");

      // optional: langsung refresh dari server biar pasti sinkron
      await loadArchive();
    } catch (error) {
      console.error(error);
      showNotificationError("Gagal menghapus data archive!");
    }
  };

  // kalau ada restoreArchive, aktifkan
  // const handleRestore = async (uuid: string) => {
  //   try {
  //     await restoreArchive(uuid);
  //     showNotification("Berhasil mengembalikan data dari archive!");
  //     await loadArchive(); // ✅ refresh lagi
  //   } catch (error) {
  //     console.error(error);
  //     showNotificationError("Gagal restore data archive!");
  //   }
  // };

  const uploadProps: UploadProps = {
    accept: ".xlsx,.xls,.csv",
    showUploadList: false,
    maxCount: 1,
    beforeUpload: async (file) => {
      try {
        setIsImporting(true);

        const formData = new FormData();
        formData.append("file", file);

        await importDataArchive(formData);

        showNotification("Import data archive berhasil!");

        // ✅ reset state biar data baru keliatan + balik ke page 1
        setQuery("");
        setYear(undefined);
        setPagination((p) => ({ ...p, current: 1 }));

        // ✅ refresh data otomatis
        await loadArchive();
      } catch (error) {
        console.error(error);
        showNotificationError("Gagal import data archive!");
      } finally {
        setIsImporting(false);
      }

      return false;
    },
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow">
      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        className="w-full mb-4"
        size={isMobile ? "small" : "middle"}
        style={{ justifyContent: "space-between" }}
      >
        <Space direction={isMobile ? "vertical" : "horizontal"}>
          <Input.Search
            placeholder="Cari berdasarkan no permohonan..."
            allowClear
            enterButton
            value={query}
            onSearch={(v) => setQuery(String(v || ""))}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: isMobile ? "100%" : 360 }}
          />
          <Select
            value={year ?? ""}
            onChange={(v) => setYear((v as string) || undefined)}
            allowClear
            placeholder="Pilih Tahun Lahir"
            options={[{ label: "Semua Tahun", value: "" }, ...yearOptions]}
            style={{
              minWidth: isMobile ? 180 : 180,
              width: isMobile ? "100%" : undefined,
            }}
          />
        </Space>

        <Space direction={isMobile ? "vertical" : "horizontal"}>
          <Button
            onClick={() => navigate("/admin/arsip/create")}
            type="primary"
            size={isMobile ? "middle" : "large"}
            block={isMobile}
            style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
          >
            Tambah Data
          </Button>

          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={isImporting}
              size={isMobile ? "middle" : "large"}
              block={isMobile}
            >
              Import File
            </Button>
          </Upload>
        </Space>
      </Space>

      <div className="overflow-x-auto">
        <Table
          columns={archiveColumns({
            current: pagination.current,
            pageSize: pagination.pageSize,
            onDelete: handleDelete,
            // onRestore: handleRestore,
          })}
          dataSource={filteredArchive.map((item, index) => ({
            ...item,
            no: (pagination.current - 1) * pagination.pageSize + (index + 1),
          }))}
          rowKey="uuid"
          loading={isLoading}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredArchive.length,
            onChange: (page, pageSize) =>
              setPagination((p) => ({ ...p, current: page, pageSize })),
            showSizeChanger: false,
            position: isMobile ? ["bottomCenter"] : ["bottomRight"],
            responsive: true,
          }}
          components={{
            header: {
              cell: (props: any) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#cce0ff",
                    textAlign: "center",
                    color: "black",
                    fontSize: isMobile ? 12 : 14,
                    padding: isMobile ? "8px 6px" : "12px 8px",
                  }}
                />
              ),
            },
          }}
        />
      </div>
    </div>
  );
};

export default ArchiveDefault;
