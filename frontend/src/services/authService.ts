import { api } from "./api";

export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export const authService = {
	async login(email: string, password: string): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
			email,
			password,
		});
		return response.data.data;
	},

	async register(name: string, email: string, password: string): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
			name,
			email,
			password,
		});
		return response.data.data;
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},
};
