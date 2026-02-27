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
	/**
	 * Generate task description using AI (mock implementation)
	 * In production, this would call OpenAI API or similar
	 */
	async generateDescription(input: GenerateDescriptionInput): Promise<string> {
		if (!input.title?.trim()) {
			throw new AIError("Task title is required", 400);
		}

		// Mock AI response based on title and priority
		const title = input.title.trim();
		const priority = input.priority;

		const descriptions: Record<"low" | "medium" | "high", string> = {
			low: `Bu görev ${title} işlemini düşük öncelik ile tamamlamak için oluşturulmuştur. Gerekli kaynakları tahsis etmeden önce diğer önemli görevleri tamamlamayı düşünün.`,
			medium: `${title} görevini orta seviye öncelik ile yapınız. Bu görev sistem için önemlidir ve zamanında tamamlanması gerekmektedir.`,
			high: `${title} görevini acil olarak tamamlanması gerekmektedir. Yüksek öncelikli bu görev için gerekli tüm kaynakları ayırın.`,
		};

		return descriptions[priority];
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
