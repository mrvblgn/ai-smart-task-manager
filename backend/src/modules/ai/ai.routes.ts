import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { AIController } from "./ai.controller.js";
import { AIService } from "./ai.service.js";

const router = Router();

const aiService = new AIService();
const aiController = new AIController(aiService);

router.use(authenticate);

router.post("/generate-description", aiController.generateDescription);
router.post("/categorize", aiController.categorizeTask);

export default router;
