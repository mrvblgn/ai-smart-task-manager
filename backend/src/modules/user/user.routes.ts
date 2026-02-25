import { Router } from "express";
import { UserController } from "./user.controller.js";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get("/", userController.getUserByEmail);
router.get("/:id", userController.getUserById);

export default router;
