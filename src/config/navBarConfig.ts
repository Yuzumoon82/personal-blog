import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,

		{
			name: "链接",
			url: "/links/",
			icon: "material-symbols:link",
			children: [
				{
					name: "GitHub",
					url: "https://github.com/Yuzumoon82",
					external: true,
					icon: "fa7-brands:github",
				},
			],
		},

		{
			name: "我的",
			url: "/content/",
			icon: "material-symbols:person",
			children: [
				{
					name: "电视剧/综艺",
					url: "/anime/",
					icon: "material-symbols:movie",
				},
				{
					name: "日记",
					url: "/diary/",
					icon: "material-symbols:book",
				},
				{
					name: "相册",
					url: "/albums/",
					icon: "material-symbols:photo-library",
				},
				{
					name: "设备",
					url: "/devices/",
					icon: "material-symbols:devices",
				},
			],
		},

		{
			name: "关于",
			url: "/content/",
			icon: "material-symbols:info",
			children: [
				{
					name: "关于我",
					url: "/about/",
					icon: "material-symbols:person",
				},
				{
					name: "常用网站",
					url: "/friends/",
					icon: "material-symbols:group",
				},
			],
		},

		{
			name: "更多",
			url: "#",
			icon: "material-symbols:more-horiz",
			children: [
				{
					name: "项目",
					url: "/projects/",
					icon: "material-symbols:work",
				},
				{
					name: "技能",
					url: "/skills/",
					icon: "material-symbols:psychology",
				},
				LinkPreset.AITools,
				{
					name: "时间线",
					url: "/timeline/",
					icon: "material-symbols:timeline",
				},
			],
		},
	],
};
