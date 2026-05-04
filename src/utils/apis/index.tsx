import axios, { AxiosError } from "axios";
import { getItem, removeItem, setItem } from "../storages";
import { jwtDecode } from "jwt-decode";
import type { AuthProps } from "../../types/auth";

const API_JWT = axios.create({
  baseURL: "http://localhost:2021",
  withCredentials: true,
});

API_JWT.interceptors.request.use(
  async (req) => {
    const profile = getItem("profile");
    if (profile?.token) {
      const currentDate = new Date();
      const isExpired =
        profile?.expire && profile.expire * 1000 < currentDate.getTime();

      if (isExpired) {
        try {
          const response = await axios.get(
            "http://localhost:2021/auth/refresh-token",
          );

          const newToken = response.data.token;
          const decoded = jwtDecode(newToken);
          setItem({
            key: "profile",
            value: {
              token: newToken,
              data: response?.data?.dataForClient,
              expire: decoded?.exp,
            },
          });
          req.headers.Authorization = `Bearer ${response?.data?.token}`;
        } catch (error) {
          const err = error as AxiosError;
          if (err?.response?.status == 401) {
            removeItem("profile");
            window.location.href = "/";
          } else {
            console.log(err);
          }
        }
      } else {
        req.headers.Authorization = `Bearer ${profile?.token}`;
      }
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// api auth
export const login = (data: AuthProps) => API_JWT.post("/auth/login", data);
export const logout = () => API_JWT.delete("/auth/logout");

//api archive
export const fetchArchive = () => API_JWT.get("/archive");
export const deleteArchive = async (uuid: string) => {
  return await API_JWT.delete(`/archive/delete/${uuid}`);
};
export const fetchArchiveById = (uuid: string) => {
  return API_JWT.get(`/archive/${uuid}`);
};
export const createArchive = (data: any) =>
  API_JWT.post("/archive/create", data);
export const importDataArchive = (data: {}) =>
  API_JWT.post("/archive/import", data);

// update archive
export const updateArchive = (uuid: string, data: FormData) =>
  API_JWT.put(`/archive/update/${uuid}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateArchiveStatus = (uuid: string, status: string) => {
  return API_JWT.put(`/archive/update-status/${uuid}`, {
    application_status: status,
  });
};

//api barang
export const fetchBarang = () => API_JWT.get("/barang");
export const createBarang = (data: FormData) =>
  API_JWT.post("/barang/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBarang = (id: string, formData: FormData) =>
  API_JWT.put(`/barang/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getBarangById = (id: string) => API_JWT.get(`/barang/${id}`);
export const deleteBarang = async (id: string) => {
  return await API_JWT.delete(`/barang/delete/${id}`);
};

// api peminjaman
export const createPeminjaman = (data: FormData) =>
  API_JWT.post("/peminjaman/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getRiwayatPeminjaman = () => API_JWT.get("/peminjaman");
export const riwayat = () => API_JWT.get("/peminjaman/riwayat");
export const updateStatusPeminjaman = (uuid: string, status: string) =>
  API_JWT.put(`/peminjaman/update/${uuid}`, { status });

// api borrowing
export const fetchBorrowing = () => API_JWT.get("/borrowing");
export const deleteBorrowing = async (uuid: string) => {
  return await API_JWT.delete(`/borrowing/delete/${uuid}`);
};
export const fetchBorrowingById = (uuid: string) => {
  return API_JWT.get(`/borrowing/${uuid}`);
};
export const createBorrowing = (data: any) =>
  API_JWT.post("/borrowing/create", data);
export const updateBorrowing = (uuid: string, data: any) =>
  API_JWT.put(`/borrowing/update/${uuid}`, data);
export const updateStatusBorrowing = (uuid: string, data: any) =>
  API_JWT.put(`/borrowing/update-status/${uuid}`, data);
export const getBorrowingUser = () => API_JWT.get("/borrowing/user");

// api user
export const fetchUsers = () => API_JWT.get("/user");
export const createUser = (data: any) => API_JWT.post("/user/create", data);
export const fetchUserById = (uuid: string) => API_JWT.get(`/user/${uuid}`);

export const getUserById = (uuid: string) => fetchUserById(uuid);
export const updateUser = (uuid: string, data: any) =>
  API_JWT.put(`/user/update/${uuid}`, data);
export const deleteUser = async (uuid: string) => {
  return await API_JWT.delete(`/user/delete/${uuid}`);
};
