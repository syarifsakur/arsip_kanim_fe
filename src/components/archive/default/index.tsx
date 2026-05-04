import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  Button,
  Grid,
  Space,
  Input,
  Upload,
  Select,
  Popconfirm,
  Empty,
} from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { archiveColumns } from "../../../columns/archive.columns";
import type { ArchiveItem } from "../../../types/archive";
import { showNotification, showNotificationError } from "../../../utils";
import {
  deleteArchive,
  fetchArchive,
  importDataArchive,
  updateArchiveStatus,
} from "../../../utils/apis";
import logoImigrasi from "../../../assets/logo-imigrasi-removebg-preview.png";
import logoKanim from "../../../assets/logo-imigrasi-removebg-preview.png";

const { useBreakpoint } = Grid;

const ArchiveDefault: React.FC = () => {
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [filteredArchive, setFilteredArchive] = useState<ArchiveItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [year, setYear] = useState<string | undefined>(undefined);
  const [applicationYear, setApplicationYear] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = useMemo(() => !screens.md, [screens]);

  const birthYearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        archive
          .map((a) =>
            a.date_of_birth ? String(a.date_of_birth).slice(0, 4) : "",
          )
          .filter((y) => y && /^\d{4}$/.test(y)),
      ),
    ).sort((a, b) => Number(b) - Number(a));
    return years.map((y) => ({ label: y, value: y }));
  }, [archive]);

  const applicationYearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        archive
          .map((a) =>
            a.application_date ? String(a.application_date).slice(0, 4) : "",
          )
          .filter((y) => y && /^\d{4}$/.test(y)),
      ),
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
        (item) => item.application_number !== "TOTAL DATA",
      );

      setArchive(cleaned);

      // initial filter using query + year + applicationYear
      const q = query.toLowerCase();
      const filtered = cleaned.filter((item) => {
        const matchQuery =
          String(item.application_number || "")
            .toLowerCase()
            .includes(q) ||
          String(item.full_name || "")
            .toLowerCase()
            .includes(q);
        const dob = item.date_of_birth || "";
        const dobYear = dob ? String(dob).slice(0, 4) : "";
        const matchYear = !year || dobYear === year;

        const appDate = item.application_date || "";
        const appYear = appDate ? String(appDate).slice(0, 4) : "";
        const matchAppYear = !applicationYear || appYear === applicationYear;

        return matchQuery && matchYear && matchAppYear;
      });
      setFilteredArchive(filtered);
    } catch (error) {
      console.error("Error fetching archive:", error);
      showNotificationError("Gagal mengambil data archive!");
    } finally {
      setIsLoading(false);
    }
  }, [query, year, applicationYear]);

  // initial load
  useEffect(() => {
    loadArchive();
  }, [loadArchive]);

  // responsive page size
  useEffect(() => {
    const nextSize = isMobile ? 5 : 10;
    setPagination((p) =>
      p.pageSize === nextSize ? p : { ...p, pageSize: nextSize, current: 1 },
    );
  }, [isMobile]);

  // filter archive based on query + year + applicationYear
  useEffect(() => {
    setPagination((p) => ({ ...p, current: 1 }));

    const q = query.toLowerCase();
    const filtered = archive.filter((item) => {
      const matchQuery =
        String(item.application_number || "")
          .toLowerCase()
          .includes(q) ||
        String(item.full_name || "")
          .toLowerCase()
          .includes(q);
      const dob = item.date_of_birth || "";
      const dobYear = dob ? String(dob).slice(0, 4) : "";
      const matchYear = !year || dobYear === year;

      const appDate = item.application_date || "";
      const appYear = appDate ? String(appDate).slice(0, 4) : "";
      const matchAppYear = !applicationYear || appYear === applicationYear;

      return matchQuery && matchYear && matchAppYear;
    });
    setFilteredArchive(filtered);
  }, [query, year, applicationYear, archive]);

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

  const handleBulkInactive = async () => {
    try {
      setIsUpdatingStatus(true);

      let successCount = 0;
      let failedCount = 0;

      // Update all filtered archives to inactive sequentially
      for (const item of filteredArchive) {
        try {
          const response = await updateArchiveStatus(item.uuid, "inactive");
          console.log(`Success updating ${item.uuid}:`, response?.data);
          successCount++;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.msg || error?.message || "Unknown error";
          console.error(
            `Gagal mengubah status arsip ${item.uuid}:`,
            errorMsg,
            error?.response?.data,
          );
          failedCount++;
        }
      }

      if (failedCount > 0) {
        showNotificationError(
          `Berhasil mengubah ${successCount} arsip, gagal mengubah ${failedCount} arsip!`,
        );
      } else {
        showNotification(
          `Berhasil mengubah status ${successCount} arsip menjadi tidak aktif!`,
        );
      }

      // Refresh data setelah semua update selesai
      await loadArchive();
    } catch (error) {
      console.error(error);
      showNotificationError("Gagal mengubah status arsip!");
    } finally {
      setIsUpdatingStatus(false);
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
        setApplicationYear(undefined);
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

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Fungsi untuk menggambar header di setiap halaman
      const drawHeader = () => {
        // Add logos dari assets - kiri dan kanan
        try {
          // Logo kiri (Kanim)
          doc.addImage(logoKanim, "PNG", 16, 8, 14, 14);
          // Logo kanan (Imigrasi)
          doc.addImage(logoImigrasi, "PNG", pageWidth - 30, 8, 14, 14);
        } catch (error) {
          console.log("Logo tidak ditemukan, skip logo");
        }

        // Title
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(
          "KEMENTERIAN HUKUM DAN HAM ASASI MANUSIA REPUBLIK INDONESIA",
          pageWidth / 2,
          10,
          { align: "center" },
        );

        doc.setFontSize(9);
        doc.text("KANTOR IMIGRASI KELAS I TPI PALU", pageWidth / 2, 16, {
          align: "center",
        });

        // Header info
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Daftar Arsip Inaktif yang dipindahkan", 8, 28);
        doc.text("Nama Unit Penyimpan: Seksi TIKKIM", 8, 32);
      };

      // Gambar header di halaman pertama
      drawHeader();

      // Table headers dengan kolom sesuai gambar
      const headers = [
        "NO",
        "KODE KLASIFIKASI",
        "NOMOR ARSIP/PERMOHONAN",
        "URAIAN INFORMASI ARSIP",
        "KURUN WAKTU",
        "JUMLAH",
        "TINGKAT PERKEMBANGAN",
        "KETERANGAN NOMOR REGISTRASI",
      ];

      const data = filteredArchive.map((item, index) => {
        const appYear = item.application_date
          ? String(item.application_date).slice(0, 4)
          : "-";
        const appMonth = item.application_date
          ? String(item.application_date).slice(5, 7)
          : "-";
        const birthYear = item.date_of_birth
          ? String(item.date_of_birth).slice(0, 4)
          : "-";

        const keterangan =
          appYear !== "-" && birthYear !== "-"
            ? `${appYear}/${birthYear}`
            : "-";

        return [
          String(index + 1),
          "QR.01.02",
          item.no_archive || item.application_number || "-",
          `Permohonan Berkas Dokumen Perjalanan Republik Indonesia (DPRI) an. ${item.full_name || "-"}`,
          appYear,
          "1",
          "Asli, Fotocopy",
          keterangan,
        ];
      });

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 36,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
          halign: "center",
          valign: "middle",
        },
        headStyles: {
          fillColor: [153, 204, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          lineWidth: 0.3,
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { halign: "center", cellWidth: 30 },
          2: { halign: "center", cellWidth: 28 },
          3: { halign: "left", cellWidth: 80 },
          4: { halign: "center", cellWidth: 25 },
          5: { halign: "center", cellWidth: 15 },
          6: { halign: "center", cellWidth: 40 },
          7: { halign: "center", cellWidth: 50 },
        },
        margin: { left: 8, right: 8, top: 36 },
        didDrawPage: function (data) {
          // Gambar header di setiap halaman baru
          if (data.pageNumber > 1) {
            drawHeader();
          }
        },
      });

      // Download
      const timestamp = new Date().toISOString().split("T")[0];
      doc.save(`Daftar_Arsip_${timestamp}.pdf`);

      showNotification("Berhasil download PDF!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showNotificationError("Gagal membuat PDF!");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        className="w-full mb-6"
        size={isMobile ? "small" : "middle"}
        style={{ justifyContent: "space-between" }}
      >
        <Space direction={isMobile ? "vertical" : "horizontal"}>
          <Input.Search
            placeholder="Cari no permohonan atau nama pemohon..."
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
            placeholder="Filter Tahun Lahir"
            options={[
              { label: "Semua Tahun Lahir", value: "" },
              ...birthYearOptions,
            ]}
            style={{
              minWidth: isMobile ? 180 : 180,
              width: isMobile ? "100%" : undefined,
            }}
          />
          <Select
            value={applicationYear ?? ""}
            onChange={(v) => setApplicationYear((v as string) || undefined)}
            allowClear
            placeholder="Filter Tahun Pembuatan"
            options={[
              { label: "Semua Tahun Pembuatan", value: "" },
              ...applicationYearOptions,
            ]}
            style={{
              minWidth: isMobile ? 180 : 200,
              width: isMobile ? "100%" : undefined,
            }}
          />
        </Space>

        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          size={isMobile ? "small" : "middle"}
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <Popconfirm
            title="Nonaktifkan Semua Arsip yang Ditampilkan?"
            description={`${filteredArchive.length} arsip akan diubah statusnya menjadi tidak aktif.`}
            onConfirm={handleBulkInactive}
            okText="Ya"
            cancelText="Batal"
            disabled={filteredArchive.length === 0}
          >
            <Button
              danger
              size="middle"
              block={isMobile}
              loading={isUpdatingStatus}
              disabled={filteredArchive.length === 0}
              style={{ minWidth: isMobile ? "100%" : 100 }}
            >
              Nonaktifkan
            </Button>
          </Popconfirm>

          <Button
            onClick={() => navigate("/admin/arsip/create")}
            type="primary"
            size="middle"
            block={isMobile}
            style={{
              minWidth: isMobile ? "100%" : 110,
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
            }}
          >
            Tambah Data
          </Button>

          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={isImporting}
              size="middle"
              block={isMobile}
              style={{ minWidth: isMobile ? "100%" : 110 }}
            >
              Import File
            </Button>
          </Upload>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            size="middle"
            block={isMobile}
            disabled={filteredArchive.length === 0}
            style={{ minWidth: isMobile ? "100%" : 120 }}
          >
            Download PDF
          </Button>
        </Space>
      </Space>

      <div
        className="flex-1 min-h-0 overflow-x-auto"
        style={{ marginTop: "10px" }}
      >
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
          locale={{
            emptyText: (
              <div className="flex min-h-[40%] items-center justify-center">
                <Empty description="Belum ada data archive" />
              </div>
            ),
          }}
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
