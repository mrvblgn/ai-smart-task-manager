import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../store/taskStore";
import type { TaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authStore";
import type { AuthStore } from "../store/authStore";
import { taskService, type CreateTaskInput } from "../services/taskService";

export function TaskDashboard() {
	const navigate = useNavigate();
	const [showForm, setShowForm] = useState<boolean>(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreateTaskInput>({
		title: "",
		description: "",
		priority: "medium",
	});

	const tasks = useTaskStore((state: TaskStore) => state.tasks);
	const filters = useTaskStore((state: TaskStore) => state.filters);
	const isLoading = useTaskStore((state: TaskStore) => state.isLoading);
	const error = useTaskStore((state: TaskStore) => state.error);
	const setTasks = useTaskStore((state: TaskStore) => state.setTasks);
	const addTask = useTaskStore((state: TaskStore) => state.addTask);
	const updateTask = useTaskStore((state: TaskStore) => state.updateTask);
	const deleteTask = useTaskStore((state: TaskStore) => state.deleteTask);
	const setFilters = useTaskStore((state: TaskStore) => state.setFilters);
	const setLoading = useTaskStore((state: TaskStore) => state.setLoading);
	const setError = useTaskStore((state: TaskStore) => state.setError);
	const user = useAuthStore((state: AuthStore) => state.user);
	const logout = useAuthStore((state: AuthStore) => state.logout);
	const isAuthenticated = useAuthStore(
		(state: AuthStore) => state.isAuthenticated()
	);

	function handleLogout() {
		logout();
		navigate("/login", { replace: true });
	}

	useEffect(() => {
		if (!isAuthenticated) return;
		loadTasks();
	}, [isAuthenticated, filters]);

	async function loadTasks() {
		try {
			setLoading(true);
			setError(null);
			const data = await taskService.listTasks(filters);
			setTasks(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Görevler yüklenemedi");
		} finally {
			setLoading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!formData.title.trim()) {
			setError("Başlık zorunludur");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			if (editingId) {
				const updated = await taskService.updateTask(editingId, formData);
				updateTask(editingId, updated);
			} else {
				const created = await taskService.createTask(formData);
				addTask(created);
			}

			setFormData({
				title: "",
				description: "",
				priority: "medium",
			});
			setEditingId(null);
			setShowForm(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Görev kaydedilemedi");
		} finally {
			setLoading(false);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm("Bu görev silinsin mi?")) return;

		try {
			setLoading(true);
			setError(null);
			await taskService.deleteTask(id);
			deleteTask(id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Görev silinemedi");
		} finally {
			setLoading(false);
		}
	}

	function handleEdit(id: string) {
		const task = tasks.find((t) => t._id === id);
		if (task) {
			setFormData({
				title: task.title,
				description: task.description,
				priority: task.priority,
				status: task.status,
				dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
				startDate: task.startDate ? new Date(task.startDate) : undefined,
			});
			setEditingId(id);
			setShowForm(true);
		}
	}

	function handleStatusChange(id: string, status: string) {
		const task = tasks.find((t) => t._id === id);
		if (task) {
			handleEdit(id);
			setFormData((prev) => ({
				...prev,
				status: status as "todo" | "in_progress" | "done",
			}));
		}
	}

	const filteredTasks = tasks.filter((task) => {
		if (filters.status && task.status !== filters.status) return false;
		if (filters.priority && task.priority !== filters.priority) return false;
		return true;
	});

	return (
		<div className="task-dashboard">
			<div className="dashboard-topbar">
				<div className="topbar-brand">
					<div className="brand-dot" />
					<span>AI Smart Task Manager</span>
				</div>
				<div className="topbar-right">
					<span className="topbar-user">{user?.name || "User"}</span>
					<button className="btn btn-small" onClick={handleLogout}>
						Çıkış Yap
					</button>
				</div>
			</div>

			<div className="welcome-strip">
				<p>
					Hoş geldin{user?.name ? `, ${user.name}` : ""}. Bugün görevlerini düzenli bir
					şekilde ilerlet.
				</p>
			</div>

			<div className="dashboard-header">
				<h1>Görevlerim</h1>
				<button
					onClick={() => {
						setShowForm(!showForm);
						setEditingId(null);
						setFormData({
							title: "",
							description: "",
							priority: "medium",
						});
					}}
					className="btn btn-primary"
				>
					{showForm ? "İptal" : "Yeni Görev"}
				</button>
			</div>

			{error && <div className="error-message">{error}</div>}

			<div className="filters-section">
				<select
					value={filters.status || ""}
					onChange={(e) =>
						setFilters({
							...filters,
							status: (e.target.value as any) || undefined,
						})
					}
					className="filter-select"
				>
					<option value="">Tüm Durumlar</option>
					<option value="todo">Yapılacak</option>
					<option value="in_progress">Devam Ediyor</option>
					<option value="done">Tamamlandı</option>
				</select>

				<select
					value={filters.priority || ""}
					onChange={(e) =>
						setFilters({
							...filters,
							priority: (e.target.value as any) || undefined,
						})
					}
					className="filter-select"
				>
					<option value="">Tüm Öncelikler</option>
					<option value="low">Düşük</option>
					<option value="medium">Orta</option>
					<option value="high">Yüksek</option>
				</select>
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} className="task-form">
					<div className="form-group">
						<label>Başlık</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="form-group">
						<label>Açıklama</label>
						<textarea
							value={formData.description || ""}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							disabled={isLoading}
						/>
					</div>

					<div className="form-group">
						<label>Öncelik</label>
						<select
							value={formData.priority}
							onChange={(e) =>
								setFormData({
									...formData,
									priority: e.target.value as
										| "low"
										| "medium"
										| "high",
								})
							}
							disabled={isLoading}
						>
							<option value="low">Düşük</option>
							<option value="medium">Orta</option>
							<option value="high">Yüksek</option>
						</select>
					</div>

					<div className="form-actions">
						<button
							type="submit"
							className="btn btn-success"
							disabled={isLoading}
						>
							{isLoading ? "Kaydediliyor..." : editingId ? "Güncelle" : "Oluştur"}
						</button>
					</div>
				</form>
			)}

			{isLoading && !showForm && <div className="loading">Görevler yükleniyor...</div>}

			{filteredTasks.length === 0 && !isLoading && (
				<div className="empty-state">
					<p>Henüz görev yok. İlk görevini oluştur!</p>
				</div>
			)}

			<div className="tasks-list">
				{filteredTasks.map((task) => (
					<div key={task._id} className="task-card">
						<div className="task-header">
							<h3>{task.title}</h3>
							<span className={`priority-badge priority-${task.priority}`}>
								{task.priority}
							</span>
						</div>

						{task.description && (
							<p className="task-description">{task.description}</p>
						)}

						<div className="task-meta">
							<span className={`status-badge status-${task.status}`}>
								{task.status.replace("_", " ")}
							</span>
							{task.dueDate && (
								<span className="due-date">
									Bitiş: {new Date(task.dueDate).toLocaleDateString()}
								</span>
							)}
						</div>

						<div className="task-actions">
							<select
								value={task.status}
								onChange={(e) =>
									handleStatusChange(
										task._id,
										e.target.value
									)
								}
								className="status-select"
							>
								<option value="todo">Yapılacak</option>
								<option value="in_progress">Devam Ediyor</option>
								<option value="done">Tamamlandı</option>
							</select>

							<button
								onClick={() => handleEdit(task._id)}
								className="btn btn-small"
								disabled={isLoading}
							>
								Düzenle
							</button>

							<button
								onClick={() => handleDelete(task._id)}
								className="btn btn-danger btn-small"
								disabled={isLoading}
							>
								Sil
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
