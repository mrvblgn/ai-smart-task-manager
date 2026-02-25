import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { TaskController } from "./task.controller.js";
import { TaskRepository } from "./task.repository.js";
import { TaskService } from "./task.service.js";

const router = Router();

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

router.use(authenticate);

router.get("/", taskController.listMyTasks);
router.post("/", taskController.createTask);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
