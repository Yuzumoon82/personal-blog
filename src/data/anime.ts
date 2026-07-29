// 本地番剧数据配置
export interface AnimeItem {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
}

const localAnimeList: AnimeItem[] = [
	{
		title: "灿如繁星",
		status: "watching",
		rating: 8.3,
		cover: "/assets/anime/lkls.jpg",
		description: "未来人生里，不远狭路，终见光明。",
		episodes: "32 episodes",
		year: "2026",
		genre: ["青春", "偶像爱情","言情"],
		studio: "李青蓉",
		link: "https://www.iqiyi.com/v_2a6v8nxlc5c.html?a=image&qyTrace=AgFv6fQnQR7Lgfia",
		progress: 29,
		totalEpisodes: 32,
		startDate: "2026-07",
		endDate: "2026-07",
	},
	{
		title: "终极笔记",
		status: "completed",
		rating: 9.0,
		cover: "/assets/anime/rynh.jpg",
		description: "铁三角探寻终极之谜",
		episodes: "36 episodes",
		year: "2020",
		genre: ["探秘寻宝", "青春","奇幻"],
		studio: "邹曦、马小刚",
		link: "https://www.iqiyi.com/v_2gdlipdh9cc.html?qyTrace=BkRAmfddnOilmum8&e2=38d12dcce07a02ebc7eda55892bd2f59",
		progress: 36,
		totalEpisodes: 36,
		startDate: "2020-12",
		endDate: "2021-01",
	},
	{
		title: "南部档案",
		status: "completed",
		rating: 8.1,
		cover: "/assets/anime/laxxx.jpg",
		description: "南洋生死簿一命换一命",
		episodes: "33 episodes",
		year: "2026",
		genre: ["探秘寻宝"],
		studio: "周靖涛、南派三叔",
		link: "https://www.iqiyi.com/v_13taa340ji8.html?qyTrace=93Enynp4WGEne68H&e2=31012dcbc683076a2b33e05797306977",
		progress: 33,
		totalEpisodes: 33,
		startDate: "2026-06",
		endDate: "2026-06",
	},
	{
		title: "九门",
		status: "planned",
		rating: 9.0,
		cover: "/assets/anime/tz1.jpg",
		description: "九门众人用热血和牺牲，守护家园，共渡难关",
		episodes: "30 episodes",
		year: "2026",
		genre: ["探秘寻宝", "悬疑"],
		studio: "柏杉",
		link: "https://so.youku.com/search/q_%E4%B9%9D%E9%97%A8",
		progress: 0,
		totalEpisodes: 30,
		startDate: "2026-07",
		endDate: "2026-08",
	},
	{
		title: "喜人奇妙夜2",
		status: "watching",
		rating: 9.6,
		cover: "/assets/anime/cmmn.jpg",
		description: "只要大声笑，烦恼都丢掉",
		episodes: "25 episodes",
		year: "2025",
		genre: ["即兴喜剧", "趣味游戏"],
		studio: "马东",
		link: "https://v.qq.com/x/cover/mzc002004l7dytn/n4101rpnbrn.html",
		progress: 15,
		totalEpisodes: 25,
		startDate: "2025-07",
		endDate: "2025-10",
	},
];

export default localAnimeList;
