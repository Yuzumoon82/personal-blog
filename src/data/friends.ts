// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "QQ音乐",
		imgurl: `${import.meta.env.BASE_URL}images/friends/friend-1.jpg`,
		desc: "腾讯旗下的正版在线音乐平台",
		siteurl: "https://y.qq.com/",
		tags: ["Music"],
	},
	{
		id: 2,
		title: "Mizuki Docs",
		imgurl:
			"https://q.qlogo.cn/headimg_dl?dst_uin=3231515355&spec=640&img_type=jpg",
		desc: "Mizuki 使用手册",
		siteurl: "https://docs.mizuki.mysqil.com",
		tags: ["Docs"],
	},
	{
		id: 3,
		title: "微博",
		imgurl: `${import.meta.env.BASE_URL}images/friends/friend-3.jpg`,
		desc: "中国领先的社交媒体平台",
		siteurl: "https://weibo.com/",
		tags: ["Chat", "Amusement"],
	},
	{
		id: 4,
		title: "GitHub",
		imgurl: "https://avatars.githubusercontent.com/u/9919?v=4&s=640",
		desc: "Where the world builds software",
		siteurl: "https://github.com",
		tags: ["Development", "Platform"],
	},
	{
		id: 5,
		title: "语雀",
		imgurl: `${import.meta.env.BASE_URL}images/friends/friend-5.jpg`,
		desc: "蚂蚁集团旗下的专业云端知识库与文档协作工具",
		siteurl: "https://www.yuque.com/",
		tags: ["Write", "Learn"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
