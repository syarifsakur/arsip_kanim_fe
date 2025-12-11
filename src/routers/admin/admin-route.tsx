import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "../../pages";
import { getItem } from "../../utils";

const AdminRoute = () => {
  const profile = getItem("profile");
  const isAuthenticated = !!profile;

  if (!isAuthenticated) return <Navigate to="/" />;
  return (
    <Routes>
      <Route path="/" element={<Navigate to={"dashboard"} replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      {/* <Route path="/" element={<Navigate to={"dashboard"} replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="barang" element={<BarangPages />} />
      <Route path="barang/create" element={<BarangCreate />} />
      <Route path="barang/edit/:id" element={<BarangEdit />} />
      <Route path="peminjaman" element={<PeminjamanBarang />} />
      <Route path="peminjaman/create" element={<PeminjamanCreate />} />
      <Route path="riwayat" element={<Riwayat />} />
      <Route path="change-password" element={<ChangePassword />} /> */}
    </Routes>
  );
};

export default AdminRoute;
