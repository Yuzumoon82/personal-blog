// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "personal-blog",
		title: "Personal-Blog",
		description:
			"这是 Yuzumoon82 的个人博客站点，基于 Mizuki 主题搭建，用于记录学习笔记、技术随笔和生活点滴。",
		image: "/assets/projects/mizuki.jpg",
		category: "web",
		techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
		status: "in-progress",
		sourceCode: "https://github.com/Yuzumoon82/personal-blog",
		visitUrl: "https://yuzumoon82.github.io/personal-blog/",
		startDate: "2026-07-26",
		endDate: "2026-07-31",
		featured: true,
		tags: ["Blog", "Theme", "Open Source"],
	},
	{
		id: "learn-vue",
		title: "Learn-Vue",
		description:
			"基于 Vue 3 + Vite + TypeScript 的前端学习练习项目。",
		image: "/assets/projects/folkpatch.jpg",
		category: "web",
		techStack: ["vue", "html", "css", "Typescript"],
		status: "completed",
		sourceCode: "https://github.com/Yuzumoon82/Learn-Vue",
		visitUrl: "https://yuzumoon82.github.io/Learn-Vue/",
		startDate: "2024-03-01",
		featured: true,
		tags: ["Demo", "Vue", "Learn"],
	},

];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
