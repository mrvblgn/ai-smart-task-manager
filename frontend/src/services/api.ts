import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "").endsWith("/api")
	? rawApiUrl.replace(/\/$/, "")
	: `${rawApiUrl.replace(/\/$/, "")}/api`;

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token'ı request headers'a ekle
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
