import { api } from "./api";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
	_id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTaskInput {
	title: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	startDate?: Date;
}

export interface ListTasksQuery {
	status?: TaskStatus;
	priority?: TaskPriority;
	sortBy?: "createdAt" | "dueDate" | "priority";
	order?: "asc" | "desc";
}

export interface TaskResponse {
	success: boolean;
	data: Task;
	message?: string;
}

export interface TaskListResponse {
	success: boolean;
	data: Task[];
	message?: string;
}

export interface GenerateDescriptionResponse {
	success: boolean;
	data: {
		description: string;
	};
	message?: string;
}

export interface CategorizeTaskResponse {
	success: boolean;
	data: {
		category: string;
	};
	message?: string;
}

class TaskService {
	async listTasks(filters?: ListTasksQuery): Promise<Task[]> {
		try {
			const response = await api.get<TaskListResponse>("/tasks", {
				params: filters,
			});
			return response.data.data;
		} catch (error) {
			throw new Error(`Failed to list tasks: ${error}`);
		}
	}

	async getTask(id: string): Promise<Task> {
		try {
			const response = await api.get<TaskResponse>(`/tasks/${id}`);
			return response.data.data;
		} catch (error) {
			throw new Error(`Failed to get task: ${error}`);
		}
	}

	async createTask(input: CreateTaskInput): Promise<Task> {
		try {
			const response = await api.post<TaskResponse>("/tasks", input);
			return response.data.data;
		} catch (error) {
			throw new Error(`Failed to create task: ${error}`);
		}
	}

	async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
		try {
			const response = await api.patch<TaskResponse>(`/tasks/${id}`, input);
			return response.data.data;
		} catch (error) {
			throw new Error(`Failed to update task: ${error}`);
		}
	}

	async deleteTask(id: string): Promise<void> {
		try {
			await api.delete(`/tasks/${id}`);
		} catch (error) {
			throw new Error(`Failed to delete task: ${error}`);
		}
	}

	async generateDescription(
		title: string,
		priority: TaskPriority
	): Promise<string> {
		try {
			const response = await api.post<GenerateDescriptionResponse>(
				"/ai/generate-description",
				{
					title,
					priority,
				}
			);
			return response.data.data.description;
		} catch (error) {
			throw new Error(`Failed to generate description: ${error}`);
		}
	}

	async categorizeTask(title: string): Promise<string> {
		try {
			const response = await api.post<CategorizeTaskResponse>(
				"/ai/categorize",
				{
					title,
				}
			);
			return response.data.data.category;
		} catch (error) {
			throw new Error(`Failed to categorize task: ${error}`);
		}
	}
}

export const taskService = new TaskService();
