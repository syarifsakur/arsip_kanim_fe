// ...existing code...
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminRoute } from "./routers";
import {Login} from "./pages/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
