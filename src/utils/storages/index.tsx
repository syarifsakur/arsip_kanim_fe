interface PropsItem {
  key: string;
  value?: object | string | null;
}

export const setItem = ({ key, value }: PropsItem) => {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
  } else if (typeof value === "object") {
    localStorage.setItem(key, JSON.stringify(value));
  } else if (typeof value === "string") {
    localStorage.setItem(key, value);
  } else {
    console.log("Invalid value type");
  }
};

export const getItem = (key: string) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage`, err);
    return null;
  }
};

export const removeItem = (key: string) => {
  localStorage.removeItem(key);
};
