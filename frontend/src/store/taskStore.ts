import { create } from "zustand";
import type { Task, ListTasksQuery } from "../services/taskService";

export interface TaskStore {
	tasks: Task[];
	filters: ListTasksQuery;
	isLoading: boolean;
	error: string | null;
	setTasks: (tasks: Task[]) => void;
	addTask: (task: Task) => void;
	updateTask: (id: string, task: Task) => void;
	deleteTask: (id: string) => void;
	setFilters: (filters: ListTasksQuery) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskStore>(
	(set: (fn: (state: TaskStore) => Partial<TaskStore>) => void) => ({
		tasks: [],
		filters: {},
		isLoading: false,
		error: null,

		setTasks: (tasks: Task[]) => {
			set(() => ({
				tasks,
			}));
		},

		addTask: (task: Task) => {
			set((state: TaskStore) => ({
				tasks: [task, ...state.tasks],
			}));
		},

		updateTask: (id: string, task: Task) => {
			set((state: TaskStore) => ({
				tasks: state.tasks.map((t: Task) => (t._id === id ? task : t)),
			}));
		},

		deleteTask: (id: string) => {
			set((state: TaskStore) => ({
				tasks: state.tasks.filter((t: Task) => t._id !== id),
			}));
		},

		setFilters: (filters: ListTasksQuery) => {
			set(() => ({
				filters,
			}));
		},

		setLoading: (loading: boolean) => {
			set(() => ({
				isLoading: loading,
			}));
		},

		setError: (error: string | null) => {
			set(() => ({
				error,
			}));
		},
	})
);
