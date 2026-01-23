// ...existing code...
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminRoute, UserRoute } from "./routers";
import { Login } from "./pages/auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/user/*" element={<UserRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
