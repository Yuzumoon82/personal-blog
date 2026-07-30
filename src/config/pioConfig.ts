import type { PioConfig } from "../types/config";

// Pio 看板娘配置
export const pioConfig: PioConfig = {
	enable: false, // 启用看板娘
	models: ["/pio/models/NOIR/noir.model3.json"], // 默认模型路径
	position: "left", // 模型位置
	width: 280, // 默认宽度
	height: 250, // 默认高度
	mode: "draggable", // 默认为可拖拽模式
	hiddenOnMobile: true, // 默认在移动设备上隐藏
	hideAboutMenu: false, // 隐藏内置 About 菜单按钮
	dialog: {
		welcome: "欢迎来到 Yuzumoon 的个人博客！", // 欢迎词
		touch: [
			"你在干什么？",
			"再摸我就报警了！",
			"你太坏了!",
			"不可以这样欺负我啦！",
		], // 触摸提示
		home: "点击这里回到首页！", // 首页提示
		skin: ["想看看我的新衣服吗？", "新衣服真漂亮~"], // 换装提示
		close: "QWQ 下次再见吧~", // 关闭提示
		link: "https://github.com/LyraVoid/Mizuki", // 关于链接
	},
};
