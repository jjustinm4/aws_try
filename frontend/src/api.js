import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 15000,
});

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getStatus() {
  const response = await api.get("/status");
  return response.data;
}

export function getImageUrl() {
  return `${api.defaults.baseURL}/image?t=${Date.now()}`;
}

export async function deleteImage() {
  const response = await api.delete("/image");
  return response.data;
}
