import {TimelineItem, TimelineLink} from "../components/features/timeline/types";

export const timelineData: TimelineItem[] = [
    {
        id: "1",
        title: "中国大学生计算机设计大赛",
        description: "全国高校本科生的计算机A类学科竞赛",
        type: "achievement",
        startDate: "2026-4-19",
        endDate: "2026-5-31",
        location: "北华大学",
        organization: "吉林省教育厅高等教育处",
        position: "",
        skills: ["html","python","css"],
        achievements: ["吉林省二等奖"],
        links: [
            {
                name: "大赛官网",
                url: "https://jsjds.blcu.edu.cn",
                type: "website",
            }
        ],
        icon: "",
        color: "gold",
        featured: true,
    },
    {
        id: "2",
        title: "大学生创新创业训练计划",
        description: "国家级的本科生科研训练与实践项目",
        type: "achievement",
        startDate: "2026-5-12",
        endDate: "2026-6-27",
        location: "北华大学",
        organization: "教育部高等教育司",
        position: "",
        achievements: ["国家级立项"],
        links: [
            {
                name: "国家级大学生创新训练计划平台",
                url: "http://gjcxcy.bjtu.edu.cn/",
                type: "website",
            },
            {
                name: "吉林省大学生创新训练计划平台",
                url: "https://jldcpt.jlau.edu.cn/",
                type: "website",
            },
        ],
        icon: "",
        color: "",
        featured: true,
    },
    {
        id: "3",
        title: "Learn-vue",
        description: "基于 Vue 3 + Vite + TypeScript 的前端学习练习项目。",
        type: "project",
        startDate: "2026-7-15",
        endDate: "2026-7-25",
        skills: ["vue","typescript"],
        achievements: ["了解vue3核心知识点"],
        links: [
            {
                name: "项目网址",
                url: "https://yuzumoon82.github.io/Learn-Vue/",
                type: "website",
            },
            {
                name: "项目源代码",
                url: "https://github.com/Yuzumoon82/Learn-Vue",
                type: "website",
            },
        ],
        icon: "",
        color: "green",
        featured: true,
    },
    {
        id: "4",
        title: "Personal-Blog",
        description: "这是 Yuzumoon82 的个人博客站点，基于 Mizuki 主题搭建，用于记录学习笔记、技术随笔和生活点滴。",
        type: "project",
        startDate: "2026-7-26",
        endDate: "2026-8-18",
        skills: ["astro","typescript","css"],
        links: [
            {
                name: "项目网址",
                url: "https://yuzumoon82.github.io/personal-blog/",
                type: "website",
            },
            {
                name: "项目源代码",
                url: "https://github.com/Yuzumoon82/personal-blog",
                type: "website",
            },
        ],
        icon: "",
        color: "pink",
        featured: true,
    },
];
