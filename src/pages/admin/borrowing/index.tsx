import React from "react";
import { AdminLayout } from "../../../layouts";
import { BorrowingDefault } from "../../../components/borrowing";

const BorrowingPage: React.FC = () => {
  return (
    <AdminLayout>
      <BorrowingDefault />
    </AdminLayout>
  );
};

export default BorrowingPage;
