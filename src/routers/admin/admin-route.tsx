import { Routes, Route, Navigate } from "react-router-dom";
import {
  Dashboard,
  Archive,
  Borrowing,
  Riwayat,
  ArchiveEdit,
  ArchiveCreate,
  ArchiveDetail,
  BorrowingCreate,
  BorrowingEdit,
  ManageUserPage,
  ManageUserCreate,
  ManageUserEdit,
} from "../../pages";
import { getItem } from "../../utils";

const AdminRoute = () => {
  const profile = getItem("profile");
  const isAuthenticated = !!profile;

  if (!isAuthenticated) return <Navigate to="/" />;
  return (
    <Routes>
      <Route path="/" element={<Navigate to={"dashboard"} replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="archive" element={<Archive />} />
      <Route path="archive/detail/:id" element={<ArchiveDetail />} />
      <Route path="archive/edit/:id" element={<ArchiveEdit />} />
      <Route path="archive/create" element={<ArchiveCreate />} />
      <Route path="borrowing" element={<Borrowing />} />
      <Route path="borrowing/create" element={<BorrowingCreate />} />
      <Route path="borrowing/edit/:uuid" element={<BorrowingEdit />} />
      <Route path="peminjaman" element={<Borrowing />} />
      <Route path="riwayat" element={<Riwayat />} />
      <Route path="arsip" element={<Archive />} />
      <Route path="arsip/detail/:id" element={<ArchiveDetail />} />
      <Route path="arsip/edit/:id" element={<ArchiveEdit />} />
      <Route path="arsip/create" element={<ArchiveCreate />} />
      <Route path="manage-users" element={<ManageUserPage />} />
      <Route path="manage-users/create" element={<ManageUserCreate />} />
      <Route path="manage-users/edit/:uuid" element={<ManageUserEdit />} />
    </Routes>
  );
};

export default AdminRoute;
