import Key from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";

import {
	DEFAULT_SONG,
	LOCAL_PLAYLIST,
	SKIP_ERROR_DELAY,
	STORAGE_KEY_VOLUME,
} from "@/components/widgets/music-player/constants";
import type { RepeatMode, Song } from "@/components/widgets/music-player/types";
import { musicPlayerConfig } from "@/config";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

function getAssetPath(path: string): string {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	const base = import.meta.env.BASE_URL;
	if (path.startsWith("/")) {
		return `${base}${path.slice(1)}`;
	}
	return `${base}${path}`;
}

/**
 * QQ 音乐 JSONP fallback URL 解析。
 * 参考 @xizeyoupan/meting 实现：用 songmid 构建 QQ 音乐 getplaysongvkey 请求，
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

/** 构建 QQ 音乐 getplaysongvkey 请求 URL */
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

/** JSONP 请求：注入 <script> 标签，回调名为 qq_get_url_from_json */
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

/** 根据 QQ 音乐 vkey 响应，构建每首歌的 MP3 地址 */
function resolveMp3UrlFromVkey(
	resp: QQMusicVkeyResponse,
): Map<string, string> {
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

/** 解析歌单中所有 @ 前缀的 QQ 音乐 JSONP fallback URL */
async function resolveMetingJsonpUrls(playlist: Song[]): Promise<void> {
	// 筛选需要 JSONP 解析的歌曲：
	// - url 以 @ 开头（OVERSEAS fallback）
	// - url 为空（Meting API 无法解析）
	const pending = playlist.filter((s) => s.songmid && (!s.url || s.url.startsWith("@")));
	console.log(`[MusicPlayer] Playlist loaded: ${playlist.length} songs`);
	console.log(`[MusicPlayer] Songs needing JSONP: ${pending.length} (@prefix: ${playlist.filter(s => s.url.startsWith("@")).length}, empty: ${playlist.filter(s => !s.url).length})`);

	if (pending.length === 0) {
		console.log("[MusicPlayer] URL samples:", playlist.slice(0, 3).map(s => ({ title: s.title, songmid: s.songmid, url: s.url?.substring(0, 80) })));
		return;
	}

	const songmids = pending.map((s) => s.songmid!);
	const vkeyUrl = buildQQMusicVkeyUrl(songmids);
	console.log(`[MusicPlayer] Built vkey URL for ${songmids.length} songmids:`, songmids.slice(0, 3));

	try {
		const resp = await jsonpFetch(vkeyUrl);
		const midurlinfo = resp?.req_0?.data?.midurlinfo || [];
		console.log("[MusicPlayer] JSONP midurlinfo:", midurlinfo.map((m: any) => ({ songmid: m.songmid, purl: m.purl?.substring(0, 50) || "", result: m.result })));
		const mp3Map = resolveMp3UrlFromVkey(resp);

		// 收集 result: 104003 的 songmid，需要从歌单中移除
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

		// 从歌单移除 result: 104003 + 解析失败的歌曲（url 为空）
		const removed = playlist.filter(
			(s) => s.songmid && blockedSongmids.has(s.songmid) && !mp3Map.has(s.songmid)
		);
		// 用 splice 原地移除（从后往前删除，避免索引偏移）
		for (let i = playlist.length - 1; i >= 0; i--) {
			const s = playlist[i];
			if (s.songmid && blockedSongmids.has(s.songmid)) {
				playlist.splice(i, 1);
			}
		}
		// 同时清理 jsonp 解析失败但没有被 104003 标记的歌（如其他错误码）
		// 这些歌保留在列表但 url 为空，loadSong 时会跳过

		console.log(`[MusicPlayer] Result: ${okCount} OK, ${blockedCount} removed (104003), kept ${playlist.length} songs total`);
	} catch (e) {
		console.error("[MusicPlayer] JSONP failed:", e);
		// JSONP 失败，清空所有待解析歌曲的 url
		for (const song of pending) {
			song.url = "";
		}
	}
}

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...DEFAULT_SONG },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.7,
			isMuted: false,
			isShuffled: false,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: false,
		};
	}

	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	async initialize(): Promise<void> {
		if (typeof window === "undefined" || this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		this.audio = new Audio();
		this.setupAudioListeners();
		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("ended", () => {
			this.handleAudioEnded();
		});

		this.audio.addEventListener("error", () => {
			this.handleAudioError();
		});

		this.audio.addEventListener("loadeddata", () => {
			this.handleAudioLoaded();
		});

		this.audio.addEventListener("loadstart", () => {
			this.state.isLoading = true;
			this.broadcastState();
		});
	}

	private handleAudioEnded(): void {
		if (this.state.isRepeating === 1) {
			if (this.audio) {
				this.audio.currentTime = 0;
				this.audio.play().catch(() => {});
			}
			this.broadcastState();
		} else {
			this.next(true);
		}
	}

	private handleAudioError(): void {
		const src = this.audio?.src || "(no audio)";
		console.error(
			`[MusicPlayer] Audio error: "${this.state.currentSong.title}"`,
			`\n  src: ${src.substring(0, 200)}`,
			`\n  audio.error.code: ${this.audio?.error?.code ?? "N/A"} (1=ABORTED, 2=NETWORK, 3=DECODE, 4=SRC_NOT_SUPPORTED)`,
		);
		this.state.isLoading = false;
		this.showError(i18n(Key.musicPlayerErrorSong));

		if (this.state.playlist.length > 1) {
			setTimeout(() => this.next(true), SKIP_ERROR_DELAY);
		} else if (this.state.playlist.length <= 1) {
			this.showError(i18n(Key.musicPlayerErrorEmpty));
		}
		this.broadcastState();
	}

	private handleAudioLoaded(): void {
		this.state.isLoading = false;
		if (this.audio?.duration && this.audio.duration > 1) {
			this.state.duration = Math.floor(this.audio.duration);
			this.state.currentSong = {
				...this.state.currentSong,
				duration: this.state.duration,
			};
		}

		if (this.state.willAutoPlay || this.state.isPlaying) {
			const playPromise = this.audio?.play();
			if (playPromise !== undefined) {
				playPromise.catch(() => {
					this.state.autoplayFailed = true;
					this.state.isPlaying = false;
				});
			}
		}
		this.broadcastState();
	}

	private loadVolumeFromStorage(): void {
		if (typeof localStorage !== "undefined") {
			const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (savedVolume) {
				const volume = Number.parseFloat(savedVolume);
				if (!Number.isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		}
	}

	private registerInteractionHandler(): void {
		const handler = () => {
			if (this.state.autoplayFailed && this.audio) {
				const playPromise = this.audio.play();
				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							this.state.autoplayFailed = false;
						})
						.catch(() => {});
				}
			}
		};
		document.addEventListener("click", handler, { once: true });
		document.addEventListener("keydown", handler, { once: true });
		this.unregisterInteraction = () => {
			document.removeEventListener("click", handler);
			document.removeEventListener("keydown", handler);
		};
	}

	private async loadPlaylist(): Promise<void> {
		const mode = musicPlayerConfig.mode ?? "meting";
		const meting_api =
			musicPlayerConfig.meting_api ??
			"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";
		const meting_id = musicPlayerConfig.id ?? "14164869977";
		const meting_server = musicPlayerConfig.server ?? "netease";
		const meting_type = musicPlayerConfig.type ?? "playlist";

		if (mode === "meting") {
			await this.fetchMetingPlaylist(
				meting_api,
				meting_server,
				meting_type,
				meting_id,
			);
		} else {
			this.loadLocalPlaylist();
		}
	}

	private async fetchMetingPlaylist(
		api: string,
		server: string,
		type: string,
		id: string,
	): Promise<void> {
		if (!api || !id) {
			return;
		}

		this.state.isLoading = true;
		this.broadcastState();

		const apiUrl = api
			.replace(":server", server)
			.replace(":type", type)
			.replace(":id", id)
			.replace(":auth", "")
			.replace(":r", Date.now().toString());

		try {
			const res = await fetch(apiUrl);
			if (!res.ok) {
				throw new Error("meting api error");
			}
			const list: Record<string, unknown>[] = await res.json();
			this.state.playlist = list.map((song) => this.convertMetingSong(song));

			// 解析 QQ 音乐 @ 前缀 JSONP fallback URL（OVERSEAS 模式）
			await resolveMetingJsonpUrls(this.state.playlist);

			this.state.isLoading = false;

			if (this.state.playlist.length > 0) {
				this.loadSong(this.state.playlist[0], false);
			}
		} catch (_e) {
			this.showError(i18n(Key.musicPlayerErrorPlaylist));
			this.state.isLoading = false;
		}
		this.broadcastState();
	}

	private convertMetingSong(song: Record<string, unknown>): Song {
		const name = typeof song.name === "string" ? song.name : undefined;
		const songTitle = typeof song.title === "string" ? song.title : undefined;
		const title = name ?? songTitle ?? i18n(Key.unknownSong);
		const artistField =
			typeof song.artist === "string" ? song.artist : undefined;
		const author = typeof song.author === "string" ? song.author : undefined;
		const artist = artistField ?? author ?? i18n(Key.unknownArtist);
		let dur = (song.duration as number | undefined) ?? 0;
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
					: ((song.id as number | undefined) ?? 0),
			title,
			artist,
			cover: (song.pic as string | undefined) ?? "",
			url: (song.url as string | undefined) ?? "",
			duration: dur,
			songmid: (song.songmid as string | undefined),
		};
	}

	private loadLocalPlaylist(): void {
		this.state.playlist = [...LOCAL_PLAYLIST];
		if (this.state.playlist.length === 0) {
			this.showError("本地播放列表为空");
		} else {
			this.loadSong(this.state.playlist[0], false);
		}
	}

	private loadSong(song: Song, autoPlay = true): void {
		if (!song || !song.url) {
			console.warn(`[MusicPlayer] loadSong skipped - no url: "${song?.title ?? "unknown"}"`);
			return;
		}
		console.log(`[MusicPlayer] loadSong: "${song.title}" url=${song.url.substring(0, 100)}`);
		if (song.url !== this.state.currentSong.url) {
			this.state.currentSong = { ...song };
			if (song.url) {
				this.state.isLoading = true;
			} else {
				this.state.isLoading = false;
			}
		}
		this.state.willAutoPlay = autoPlay;
		if (this.audio) {
			if (this.audio.src && song.url) {
				this.audio.src = "";
			}
			this.audio.src = getAssetPath(song.url);
			this.audio.load();
		}
		this.broadcastState();
	}

	private showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		setTimeout(() => {
			this.state.showError = false;
			this.broadcastState();
		}, 3000);
		this.broadcastState();
	}

	hideError(): void {
		this.state.showError = false;
		this.broadcastState();
	}

	toggle(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (this.state.isPlaying) {
			this.audio.pause();
		} else {
			this.audio.play().catch(() => {});
		}
	}

	play(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		this.audio.play().catch(() => {});
	}

	pause(): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		this.audio.pause();
	}

	next(autoPlay = true): void {
		if (this.state.playlist.length <= 1) {
			return;
		}

		let newIndex: number;
		if (this.state.isShuffled) {
			do {
				newIndex = Math.floor(Math.random() * this.state.playlist.length);
			} while (
				newIndex === this.state.currentIndex &&
				this.state.playlist.length > 1
			);
		} else {
			newIndex =
				this.state.currentIndex < this.state.playlist.length - 1
					? this.state.currentIndex + 1
					: 0;
		}

		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], autoPlay);
	}

	prev(): void {
		if (this.state.playlist.length <= 1) {
			return;
		}
		const newIndex =
			this.state.currentIndex > 0
				? this.state.currentIndex - 1
				: this.state.playlist.length - 1;
		this.state.currentIndex = newIndex;
		this.loadSong(this.state.playlist[newIndex], true);
	}

	playIndex(index: number): void {
		if (index < 0 || index >= this.state.playlist.length) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	seek(time: number): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		if (this.audio) {
			this.audio.volume = clampedVolume;
			this.audio.muted = this.state.isMuted;
		}
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
		}
		this.broadcastState();
	}

	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		if (this.audio) {
			this.audio.muted = this.state.isMuted;
		}
		this.broadcastState();
	}

	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) % 3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	toggleMode(): void {
		if (this.state.isShuffled) {
			this.toggleShuffle();
			return;
		}
		if (this.state.isRepeating === 2) {
			this.toggleRepeat();
			this.toggleShuffle();
			return;
		}
		this.toggleRepeat();
	}

	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	toggleExpanded(): void {
		this.state.isExpanded = !this.state.isExpanded;
		// 保持与原先 usePlayerState.toggleExpandedUI 一致的联动行为：
		// 展开时强制取消隐藏，并关闭播放列表，避免状态组合异常
		if (this.state.isExpanded) {
			this.state.showPlaylist = false;
			this.state.isHidden = false;
		}
		this.broadcastState();
	}

	toggleHidden(): void {
		this.state.isHidden = !this.state.isHidden;
		// 保持与原先 usePlayerState.toggleHiddenUI 一致的联动行为：
		// 隐藏时收起播放器并关闭播放列表，防止展开 UI 悬挂在小球旁边
		if (this.state.isHidden) {
			this.state.isExpanded = false;
			this.state.showPlaylist = false;
		}
		this.broadcastState();
	}

	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	setProgress(percent: number): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		const newTime = percent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	destroy(): void {
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		this.isInitialized = false;
	}
}

export const musicPlayerStore = new MusicPlayerStore();
