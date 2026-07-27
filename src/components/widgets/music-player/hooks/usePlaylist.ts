import Key from "../../../../i18n/i18nKey";
import { i18n } from "../../../../i18n/translation";
import { LOCAL_PLAYLIST } from "../constants";
import type { RepeatMode, Song } from "../types";

/**
 * Meting API song response structure
 * Based on https://github.com/metowolf/MetingJS
 */
interface MetingSong {
	id?: number | string;
	name?: string;
	title?: string;
	artist?: string;
	author?: string;
	duration?: number | string;
	pic?: string;
	url?: string;
	songmid?: string;
}

/**
 * Convert Meting API song to internal Song type
 */
function convertMetingSong(song: MetingSong): Song {
	const title = song.name ?? song.title ?? i18n(Key.unknownSong);
	const artist = song.artist ?? song.author ?? i18n(Key.unknownArtist);
	let dur = song.duration ?? 0;
	if (typeof dur === "string") {
		dur = Number.parseInt(dur, 10);
	}
	if (dur > 10000) {
		dur = Math.floor(dur / 1000);
	}
	if (!Number.isFinite(dur) || dur <= 0) {
		dur = 0;
	}

	return {
		id:
			typeof song.id === "string"
				? Number.parseInt(song.id, 10)
				: (song.id ?? 0),
		title,
		artist,
		cover: song.pic ?? "",
		url: song.url ?? "",
		duration: dur,
		songmid: song.songmid,
	};
}

/**
 * QQ 音乐 JSONP fallback URL 解析。
 * 参考 @xizeyoupan/meting 实现：用 songmid 构建 getplaysongvkey 请求，
 * 通过 JSONP（带浏览器 cookie）获取真实 MP3 地址。
 */

interface QQMusicVkeyResponse {
	req_0?: {
		data?: {
			sip?: string[];
			midurlinfo?: Array<{
				songmid?: string;
				purl?: string;
				result?: number;
			}>;
		};
	};
}

function buildQQMusicVkeyUrl(songmids: string[]): string {
	const guid = String(Math.floor(Math.random() * 1e7));
	const data = {
		req_0: {
			module: "vkey.GetVkeyServer",
			method: "CgiGetVkey",
			param: {
				guid,
				songmid: songmids,
				songtype: [0],
				uin: "",
				loginflag: 1,
				platform: "20",
			},
		},
		comm: { uin: "", format: "json", ct: 19, cv: 0, authst: "" },
	};

	const params = new URLSearchParams({
		"-": "getplaysongvkey",
		g_tk: "5381",
		loginUin: "",
		hostUin: "0",
		format: "json",
		inCharset: "utf8",
		outCharset: "utf-8",
		platform: "yqq.json",
		needNewCode: "0",
		data: JSON.stringify(data),
	});

	return `https://u.y.qq.com/cgi-bin/musicu.fcg?${params.toString()}`;
}

function jsonpFetch(url: string, timeout = 10000): Promise<QQMusicVkeyResponse> {
	return new Promise((resolve, reject) => {
		const callbackName = "qq_get_url_from_json";
		const script = document.createElement("script");
		let settled = false;

		const cleanup = () => {
			if (timer) clearTimeout(timer);
			if (script.parentNode) script.parentNode.removeChild(script);
			delete (window as any)[callbackName];
		};

		const timer = setTimeout(() => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(new Error("JSONP timeout"));
		}, timeout);

		(window as any)[callbackName] = (resp: QQMusicVkeyResponse) => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(resp);
		};

		const sep = url.includes("?") ? "&" : "?";
		script.src = `${url}${sep}callback=${callbackName}`;
		script.onerror = () => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(new Error("JSONP request failed"));
		};
		document.head.appendChild(script);
	});
}

function resolveMp3UrlFromVkey(resp: QQMusicVkeyResponse): Map<string, string> {
	const result = new Map<string, string>();
	const data = resp.req_0?.data;
	if (!data) return result;

	const sip =
		(data.sip || []).find((s) => !s.startsWith("http://ws")) ||
		data.sip?.[0];
	if (!sip) return result;

	for (const info of data.midurlinfo || []) {
		if (info.songmid && info.purl) {
			result.set(info.songmid, sip + info.purl);
		}
	}
	return result;
}

async function resolveMetingJsonpUrls(playlist: Song[]): Promise<void> {
	// 筛选需要 JSONP 解析的歌曲：
	// - url 以 @ 开头（OVERSEAS fallback）
	// - url 为空（Meting API 无法解析）
	const pending = playlist.filter((s) => s.songmid && (!s.url || s.url.startsWith("@")));
	console.log(`[MusicPlayer] Playlist loaded: ${playlist.length} songs, needing JSONP: ${pending.length}`);
	if (pending.length === 0) return;

	const songmids = pending.map((s) => s.songmid!);
	const vkeyUrl = buildQQMusicVkeyUrl(songmids);

	try {
		const resp = await jsonpFetch(vkeyUrl);
		const midurlinfo = resp?.req_0?.data?.midurlinfo || [];
		console.log("[MusicPlayer] JSONP midurlinfo:", midurlinfo.map((m: any) => ({ songmid: m.songmid, purl: m.purl?.substring(0, 50) || "", result: m.result })));
		const mp3Map = resolveMp3UrlFromVkey(resp);

		// 收集 result: 104003 的 songmid
		const blockedSongmids = new Set<string>();
		for (const info of midurlinfo) {
			if (info.result === 104003 && info.songmid) {
				blockedSongmids.add(info.songmid);
			}
		}

		let okCount = 0;
		let blockedCount = 0;
		for (const song of pending) {
			const mp3Url = mp3Map.get(song.songmid!);
			song.url = mp3Url || "";
			if (mp3Url) {
				okCount++;
				console.log(`[MusicPlayer]   OK: ${song.title}`);
			} else if (blockedSongmids.has(song.songmid!)) {
				blockedCount++;
			} else {
				console.log(`[MusicPlayer]   FAILED: ${song.title}`);
			}
		}

		// 从歌单移除 result: 104003 的歌曲
		for (let i = playlist.length - 1; i >= 0; i--) {
			const s = playlist[i];
			if (s.songmid && blockedSongmids.has(s.songmid)) {
				playlist.splice(i, 1);
			}
		}

		console.log(`[MusicPlayer] Result: ${okCount} OK, ${blockedCount} removed (104003), kept ${playlist.length} songs total`);
	} catch (_e) {
		console.error("[MusicPlayer] JSONP failed:", _e);
		for (const song of pending) {
			song.url = "";
		}
	}
}

export interface PlaylistState {
	playlist: Song[];
	currentIndex: number;
	isShuffled: boolean;
	isRepeating: RepeatMode;
}

export function createPlaylistState(): PlaylistState {
	return {
		playlist: [],
		currentIndex: 0,
		isShuffled: false,
		isRepeating: 0,
	};
}

export function toggleShuffle(state: PlaylistState) {
	state.isShuffled = !state.isShuffled;
	if (state.isShuffled) {
		state.isRepeating = 0;
	}
}

export function toggleRepeat(state: PlaylistState) {
	state.isRepeating = ((state.isRepeating + 1) % 3) as RepeatMode;
	if (state.isRepeating !== 0) {
		state.isShuffled = false;
	}
}

export function previousSong(state: PlaylistState): number {
	if (state.playlist.length <= 1) {
		return state.currentIndex;
	}
	return state.currentIndex > 0
		? state.currentIndex - 1
		: state.playlist.length - 1;
}

export function nextSong(state: PlaylistState, _autoPlay = true): number {
	if (state.playlist.length <= 1) {
		return state.currentIndex;
	}

	let newIndex: number;
	if (state.isShuffled) {
		do {
			newIndex = Math.floor(Math.random() * state.playlist.length);
		} while (newIndex === state.currentIndex && state.playlist.length > 1);
	} else {
		newIndex =
			state.currentIndex < state.playlist.length - 1
				? state.currentIndex + 1
				: 0;
	}
	return newIndex;
}

export function playSong(state: PlaylistState, index: number): boolean {
	if (index < 0 || index >= state.playlist.length) {
		return false;
	}
	state.currentIndex = index;
	return true;
}

export async function fetchMetingPlaylist(
	state: PlaylistState,
	meting_api: string,
	meting_server: string,
	meting_type: string,
	meting_id: string,
	onLoadStart: () => void,
	onLoadEnd: () => void,
	showError: (message: string) => void,
): Promise<void> {
	if (!meting_api || !meting_id) {
		return;
	}

	onLoadStart();
	const apiUrl = meting_api
		.replace(":server", meting_server)
		.replace(":type", meting_type)
		.replace(":id", meting_id)
		.replace(":auth", "")
		.replace(":r", Date.now().toString());

	try {
		const res = await fetch(apiUrl);
		if (!res.ok) {
			throw new Error("meting api error");
		}
		const list: MetingSong[] = await res.json();
		state.playlist = list.map(convertMetingSong);

		// 解析 QQ 音乐 @ 前缀 JSONP fallback URL（OVERSEAS 模式）
		await resolveMetingJsonpUrls(state.playlist);

		onLoadEnd();
	} catch (_e) {
		showError(i18n(Key.musicPlayerErrorPlaylist));
		onLoadEnd();
	}
}

export function loadLocalPlaylist(
	state: PlaylistState,
	showError: (message: string) => void,
): boolean {
	state.playlist = [...LOCAL_PLAYLIST];
	if (state.playlist.length === 0) {
		showError("本地播放列表为空");
		return false;
	}
	return true;
}

export function canSkip(state: PlaylistState): boolean {
	return state.playlist.length > 1;
}
