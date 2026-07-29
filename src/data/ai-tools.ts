export type AIToolCategory =
	| "chat"
	| "coding"
	| "image"
	| "audio"
	| "video"
	| "writing"
	| "search"
	| "other";

export type AIToolFrequency =
	| "daily"
	| "weekly"
	| "occasional"
	| "experimental";

export type LocaleString = Partial<
	Record<"en" | "zh_CN" | "zh_TW" | "ja", string>
>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string;
	description: LocaleString;
	icon: string;
	category: AIToolCategory;
	frequency: AIToolFrequency;
	url?: string;
	usage?: LocaleString;
	tags?: string[];
	color?: string;
}

// Replace the examples below with your own AI tools
export const aiToolsData: AITool[] = [
	{
		id: "claude code",
		name: "Claude Code",
		description: {
			en: "代码生成、改写",
			zh_CN: "用于代码生成与总结的 AI 助手。",
		},
		icon: "material-symbols:smart-toy",
		category: "coding",
		frequency: "daily",
		url: "https://claude.ai/",
		usage: {
			en: "Daily: writing, brainstorming",
			zh_CN: "每天：代码生成、改写，总结",
		},
		tags: ["Coding"],
		color: "#C97758",
	},
	{
		id: "deepseek",
		name: "Deepseek",
		description: {
			en: "指令生成、建议推荐",
			zh_CN: "用于生成指令、推荐建议和想法的 AI 工具。",
		},
		icon: "material-symbols:code",
		category: "search",
		frequency: "occasional",
		url: "https://www.deepseek.com/",
		usage: {
			en: "指令生成、建议推荐",
			zh_CN: "每周：生成指令、推荐建议和想法",
		},
		tags: ["Search"],
		color: "#10A37F",
	},
	{
		id: "豆包",
		name: "豆包",
		description: {
			en: "An AI image generation tool for creating illustrations.",
			zh_CN: "用于生成插图的 AI 图像工具。",
		},
		icon: "material-symbols:image",
		category: "image",
		frequency: "occasional",
		url: "https://www.doubao.com/chat/",
		tags: ["Image"],
		color: "#1A73E8",
	},
];
