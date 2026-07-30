// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	Phone: [
		{
			name: "IPhone 16",
			image: `${import.meta.env.BASE_URL}images/device/oneplus13t.jpg`,
			specs: "White / 256GB",
			description: "表现惊人，设计经用。" ,
			link: "https://www.apple.com.cn/shop/buy-iphone/iphone-16",
		},
	],
	Mac: [
		{
			name: "Macbook Pro",
			image: `${import.meta.env.BASE_URL}images/device/mt3000.jpg`,
			specs: "深空灰色 / 16G + 512GB",
			description:
				"超先进的 Mac 笔电，艰巨任务巨拿手。" ,
			link: "https://www.apple.com.cn/shop/buy-mac/macbook-pro",
		},
	],
};
