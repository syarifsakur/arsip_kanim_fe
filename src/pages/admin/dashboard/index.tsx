import React, { useEffect, useState } from "react";
import { AdminLayout } from "../../../layouts";
import { Card, Col, Row, Progress } from "antd";
import {
  HddOutlined,
  AuditOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { fetchArchive, fetchBorrowing } from "../../../utils/apis";
import type { ArchiveItem } from "../../../types/archive";
import type { BorrowingItem } from "../../../types/borrowing";

// const { useBreakpoint } = Grid; // reserved for future responsive tweaks

const Dashboard: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // const screens = useBreakpoint(); // reserved for future responsive tweaks

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [arcRes, borRes] = await Promise.all([
          fetchArchive(),
          fetchBorrowing(),
        ]);

        const arcList: ArchiveItem[] =
          arcRes?.data?.data ?? arcRes?.data?.response ?? [];
        const borList: BorrowingItem[] =
          borRes?.data?.data ?? borRes?.data?.response ?? [];

        setArchives(
          (arcList || []).filter((i) => i.application_number !== "TOTAL DATA")
        );
        setBorrowings(
          (borList || []).filter((i) => i.borrowers_name !== "TOTAL DATA")
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalArchives = archives.length;
  const activeBorrowings = borrowings.filter(
    (b) => (b.status || "dipinjam") === "dipinjam"
  ).length;
  const returnedBorrowings = borrowings.filter(
    (b) => (b.status || "dipinjam") === "dikembalikan"
  ).length;
  const totalBorrowers = borrowings.length;

  // Grafik arsip berdasarkan tujuan
  const purposeCounts = {
    wisata: archives.filter(
      (a) => (a.passport_purpose || "").toLowerCase() === "wisata"
    ).length,
    umroh: archives.filter(
      (a) => (a.passport_purpose || "").toLowerCase() === "umroh"
    ).length,
    haji: archives.filter(
      (a) => (a.passport_purpose || "").toLowerCase() === "haji"
    ).length,
  };
  const knownTotal =
    purposeCounts.wisata + purposeCounts.umroh + purposeCounts.haji;
  const lainnya = Math.max(totalArchives - knownTotal, 0);

  // Grafik arsip berdasarkan jenis permohonan
  const typeCounts = (() => {
    const counts = {
      baru: 0,
      gantiPenuh: 0,
      gantiHabisMasa: 0,
      gantiHilang: 0,
    };
    archives.forEach((a) => {
      const t = (a.application_type || "").toLowerCase();
      if (!t) return;
      if (t.startsWith("baru")) counts.baru += 1;
      else if (t.includes("penuh")) counts.gantiPenuh += 1;
      else if (t.includes("habis masa berlaku")) counts.gantiHabisMasa += 1;
      else if (t.includes("hilang")) counts.gantiHilang += 1;
    });
    return counts;
  })();

  // const uniqueBorrowers = new Set(
  //   borrowings
  //     .filter((b) => b.borrowers_name && b.borrowers_name !== "TOTAL DATA")
  //     .map((b) => b.borrowers_name)
  // ).size;

  const Tile: React.FC<{
    color: string;
    icon: React.ReactNode;
    label: string;
    value: number;
  }> = ({ color, icon, label, value }) => (
    <Card
      bodyStyle={{ padding: 0 }}
      style={{ borderRadius: 8, overflow: "hidden" }}
      loading={loading}
    >
      <div style={{ display: "flex", alignItems: "stretch", height: 88 }}>
        <div
          style={{
            width: 64,
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 28, color: "#fff" }}>{icon}</div>
        </div>
        <div style={{ flex: 1, background: "#fff", padding: "12px 14px" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 0.3,
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {value}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Tile
            color="#16a3d7"
            icon={<HddOutlined />}
            label="Arsip"
            value={totalArchives}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Tile
            color="#2aa052"
            icon={<TeamOutlined />}
            label="Jumlah Peminjam"
            value={totalBorrowers}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Tile
            color="#d84b39"
            icon={<AuditOutlined />}
            label="Sedang Dipinjam"
            value={activeBorrowings}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Tile
            color="#f0ad4e"
            icon={<CheckCircleOutlined />}
            label="Dikembalikan"
            value={returnedBorrowings}
          />
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} title="Grafik Arsip Berdasarkan Tujuan">
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Wisata</div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((purposeCounts.wisata / totalArchives) * 100)
                  : 0
              }
              format={() => `${purposeCounts.wisata} Arsip`}
              strokeColor="#16a3d7"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Umroh</div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((purposeCounts.umroh / totalArchives) * 100)
                  : 0
              }
              format={() => `${purposeCounts.umroh} Arsip`}
              strokeColor="#2aa052"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Haji</div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((purposeCounts.haji / totalArchives) * 100)
                  : 0
              }
              format={() => `${purposeCounts.haji} Arsip`}
              strokeColor="#8e44ad"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Lainnya</div>
            <Progress
              percent={
                totalArchives ? Math.round((lainnya / totalArchives) * 100) : 0
              }
              format={() => `${lainnya} Arsip`}
              strokeColor="#f0ad4e"
            />
          </Col>
        </Row>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Grafik Arsip Berdasarkan Jenis Permohonan"
      >
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>BARU</div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((typeCounts.baru / totalArchives) * 100)
                  : 0
              }
              format={() => `${typeCounts.baru} Arsip`}
              strokeColor="#16a3d7"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              GANTI (PENUH/HALAMAN PENUH)
            </div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((typeCounts.gantiPenuh / totalArchives) * 100)
                  : 0
              }
              format={() => `${typeCounts.gantiPenuh} Arsip`}
              strokeColor="#2aa052"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              GANTI (HABIS MASA BERLAKU)
            </div>
            <Progress
              percent={
                totalArchives
                  ? Math.round(
                      (typeCounts.gantiHabisMasa / totalArchives) * 100
                    )
                  : 0
              }
              format={() => `${typeCounts.gantiHabisMasa} Arsip`}
              strokeColor="#8e44ad"
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
              GANTI (HILANG)
            </div>
            <Progress
              percent={
                totalArchives
                  ? Math.round((typeCounts.gantiHilang / totalArchives) * 100)
                  : 0
              }
              format={() => `${typeCounts.gantiHilang} Arsip`}
              strokeColor="#f0ad4e"
            />
          </Col>
        </Row>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
