import { notification } from "antd";

export const showNotification = (text: string) => {
  notification.success({
    message: "Berhasil",
    description: text,
    placement: "topRight",
    duration: 3,
  });
};

export const showNotificationError = (text: string) => {
  notification.error({
    message: "Gagal",
    description: text,
    placement: "topRight",
    duration: 3,
  });
};
