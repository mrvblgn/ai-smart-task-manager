import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { UserRepository } from "../user/user.repository.js";

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
