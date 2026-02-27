import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import type { AuthStore } from "./store/authStore";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TaskDashboard } from "./pages/TaskDashboard";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore(
		(state: AuthStore) => state.isAuthenticated()
	);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route
					path="/tasks"
					element={
						<ProtectedRoute>
							<TaskDashboard />
						</ProtectedRoute>
					}
				/>
				<Route path="/" element={<Navigate to="/tasks" replace />} />
			</Routes>
		</Router>
	);
}

export default App;
