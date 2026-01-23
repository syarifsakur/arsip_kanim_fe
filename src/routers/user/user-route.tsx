import { Navigate, Route, Routes } from "react-router-dom";
import { getItem } from "../../utils";
import { Dashboard} from "../../pages";
import { BorrowingCreate, BorrowingPage, Riwayat } from "../../pages/user";

const UserRoute = () => {
  const profile = getItem("profile");
  const isAuthenticated = !!profile;

  if (!isAuthenticated) return <Navigate to="/" />;
  return (
    <Routes>
      <Route path="/" element={<Navigate to={"dashboard"} replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="borrowing" element={<BorrowingPage />} />
      <Route path="borrowing/create" element={<BorrowingCreate />} />
      <Route path="riwayat" element={<Riwayat />} />
    </Routes>
  );
};

export default UserRoute;
