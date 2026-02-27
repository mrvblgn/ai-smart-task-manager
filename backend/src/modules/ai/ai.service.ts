import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GenerateDescriptionInput {
	title: string;
	priority: "low" | "medium" | "high";
}

export class AIError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.name = "AIError";
		this.statusCode = statusCode;
	}
}

export class AIService {
	private genAI: GoogleGenerativeAI;

	constructor() {
		const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
		if (!apiKey) {
			throw new AIError("GOOGLE_GEMINI_API_KEY environment variable is not set", 500);
		}
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	/**
	 * Generate task description using Google Gemini AI
	 * Falls back to mock AI if API fails
	 */
	async generateDescription(input: GenerateDescriptionInput): Promise<string> {
		if (!input.title?.trim()) {
			throw new AIError("Task title is required", 400);
		}

		// Try Gemini API first
		try {
			const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

			const priorityText =
				input.priority === "low"
					? "düşük"
					: input.priority === "high"
						? "yüksek"
						: "orta";

			const prompt = `Aşağıdaki görev için Türkçe olarak kısa bir açıklama oluştur. Açıklama maksimum 2-3 cümle olmalı ve görevin ${priorityText} önceliğini dikkate almalıdır.

Görev başlığı: "${input.title}"

Sadece açıklama yazı. Başka hiçbir şey ekleme.`;

			const result = await model.generateContent(prompt);
			const description = result.response.text().trim();

			if (!description) {
				throw new AIError("Failed to generate description", 500);
			}

			return description;
		} catch (error) {
			// Fallback to mock AI if API fails
			console.log("Gemini API quota exhausted or unavailable, using mock AI:", 
				error instanceof Error ? error.message : "Unknown error"
			);
			return this.generateMockDescription(input);
		}
	}

	/**
	 * Generate mock description based on title and priority
	 * Used as fallback when API is unavailable
	 */
	private generateMockDescription(input: GenerateDescriptionInput): string {
		const title = input.title.trim();
		const priority = input.priority;

		const mockDescriptions: Record<"low" | "medium" | "high", string> = {
			low: `Bu görev ${title} işlemini düşük öncelik ile tamamlamak için oluşturulmuştur. Gerekli kaynakları tahsis etmeden önce diğer önemli görevleri tamamlamayı düşünün.`,
			medium: `${title} görevini orta seviye öncelik ile yapınız. Bu görev sistem için önemlidir ve zamanında tamamlanması gerekmektedir.`,
			high: `${title} görevini acil olarak tamamlanması gerekmektedir. Yüksek öncelikli bu görev için gerekli tüm kaynakları ayırın.`,
		};

		return mockDescriptions[priority];
	}

	/**
	 * Categorize task based on title
	 */
	async categorizeTask(title: string): Promise<string> {
		if (!title?.trim()) {
			throw new AIError("Task title is required", 400);
		}

		const lowerTitle = title.toLowerCase();

		if (
			lowerTitle.includes("bug") ||
			lowerTitle.includes("hata") ||
			lowerTitle.includes("sorun")
		) {
			return "bug";
		}

		if (
			lowerTitle.includes("feature") ||
			lowerTitle.includes("özellik") ||
			lowerTitle.includes("yeni")
		) {
			return "feature";
		}

		if (
			lowerTitle.includes("doc") ||
			lowerTitle.includes("dokuman") ||
			lowerTitle.includes("yazı")
		) {
			return "documentation";
		}

		return "task";
	}
}
