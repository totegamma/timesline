
export interface UserPref {
	avatar: undefined | string;
	joinedChannels: string[];
}

export interface RawRTMMessage {
	type: string;
	ts: string;
	user: string;
	channel: string;
	text: string;
	reaction: string;
	item: any;
	thread_ts: string;
}

export interface RTMMessage {
	type: string;
	ts: string;
	ts_number: number;
	last_activity: number;
	user: string;
	channel: string;
	channelID: string;
	text: string;
	avatar: string;
	parent: null | string;
	datetime: string;
	reactions: Reaction[];
	thread: RTMMessage[];
	has_unloadedThread: boolean;
}

export interface Reaction {
	key: string;
	count: number;
}

