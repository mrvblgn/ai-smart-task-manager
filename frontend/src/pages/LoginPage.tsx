import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { AuthStore } from "../store/authStore";
import { authService } from "../services/authService";

export function LoginPage() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const setAuth = useAuthStore((state: AuthStore) => state.setAuth);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await authService.login(email, password);
			setAuth(response.token, response.user);
			navigate("/tasks");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Giriş başarısız");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-form">
				<h2>Giriş Yap</h2>
				{error && <div className="error-message">{error}</div>}
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>E-posta</label>
						<input
							type="email"
							placeholder="E-posta"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					<div className="form-group">
						<label>Şifre</label>
						<input
							type="password"
							placeholder="Şifre"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</div>
					<div className="form-actions">
						<button type="submit" className="btn btn-primary" disabled={loading}>
							{loading ? "İşlem yapılıyor..." : "Giriş Yap"}
						</button>
					</div>
				</form>
				<div className="auth-footer">
					<p>Hesabınız yok mu? <a href="/register">Kayıt olun</a></p>
				</div>
			</div>
		</div>
	);
}
