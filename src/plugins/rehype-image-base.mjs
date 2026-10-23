import { visit } from "unist-util-visit";

// markdown 里手写的根绝对路径（如 /images/...）不会被 Astro 自动加上 base 前缀，
// 部署在子路径（/personal-blog/）下时会 404。此插件为 img 的 src 补上 base。
export function rehypeImageBase(base) {
	const prefix = (base || "/").replace(/\/+$/, ""); // "/personal-blog" 或 ""

	return (tree) => {
		if (!prefix) {
			return;
		}

		visit(tree, "element", (node) => {
			if (node.tagName !== "img" || !node.properties?.src) {
				return;
			}
			const src = String(node.properties.src);
			// 只处理站内绝对路径：跳过协议相对（//）、外部链接、已带前缀的
			if (src.startsWith("/") && !src.startsWith("//") && !src.startsWith(prefix + "/")) {
				node.properties.src = prefix + src;
			}
		});
	};
}
