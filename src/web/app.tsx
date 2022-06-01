import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { useSession, IuseSession } from './hooks/useSession';
import { useResourceManager, IuseResourceManager } from './hooks/useResourceManager';
import { useObjectList, IuseObjectList } from './hooks/useObjectList';
import { usePersistent } from './hooks/usePersistent';

import { UserPref, RTMMessage, RawRTMMessage } from './model';

import { testMessage } from './resources/testItem';

import './style.css'

const Emoji = require('node-emoji');
const { toHTML } = require("slack-markdown");

const defaultChannelFilter = "^_.+";
const ShowTestMessage = false;

const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getEmojiList = 'https://slack.com/api/emoji.list';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';
const endpoint_getChannels = 'https://slack.com/api/users.conversations';
const endpoint_getHistory = 'https://slack.com/api/conversations.history';
const endpoint_markAsRead = 'https://slack.com/api/conversations.mark';

const ipcRenderer = (window as any).preload.ipcRenderer;

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		background: {
			default: '#222'
		},
		primary: {
			main: '#1976d2'
		}
	}
});


const App = () => {

	// =========================:: STATEs ::===============================

	const session: IuseSession = useSession();
	const messages = useObjectList<RTMMessage>();

	const [filterSource, setFilterSource] = usePersistent<string>("channelFilter", defaultChannelFilter);
	const ChannelFilter = useRef<RegExp>(new RegExp(defaultChannelFilter));
	const [autoMark, setAutoMark] = usePersistent<boolean>("automark", false);
	const AutoMarkRef = useRef<boolean>(autoMark);

	const [connected, setConnected] = useState<boolean>(false);

	const [avatar, setAvatar] = useState<undefined | string>();
	const [channels, setChannels] = useState<string[]>([]);
	const [openSetting, setOpenSetting] = useState<boolean>(false);

	const emojiDict = useRef<{ [key: string]: string}>({});

	const userDict = useResourceManager<any>(async (key: string) => {
		const res = await fetch(endpoint_getUserInfo, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': 'Bearer ' + session.userToken
			},
			body: `user=${key}`
		});
		const data = await res.json();

		if (!data.ok) {
			console.error("resolve user failed. reason: " + data.error);
			return {};
		}

		return data.user.profile;
	});


	const channelDict = useResourceManager<any>(async (key: string) => {
		const res = await fetch(endpoint_getChannelInfo, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': 'Bearer ' + session.userToken
			},
			body: `channel=${key}`

		});
		const data = await res.json();

		if (!data.ok) {
			console.error("resolve channel failed. reason: " + data.error);
			return {};
		}

		return data.channel;
	});



	// =========================:: EFFECTs ::===============================

	useEffect(() =>  {

		if (session.logined()) {
			const requestOptions = {
				method: 'POST',
				headers: {
					'authorization': 'Bearer ' + session.userToken
				}
			};

			fetch(endpoint_getEmojiList, requestOptions)
			.then(res => res.json())
			.then(data => {
				if (data.ok){
					emojiDict.current = data.emoji
				} else {
					console.error("failed to get emoji list");
				}
			});
		}

	}, [session.logined()]);


	// Reference移し
	useEffect(() => {
		AutoMarkRef.current = autoMark;
	}, [autoMark]);

	useEffect(() => {
		ChannelFilter.current = new RegExp(filterSource);
	}, [filterSource]);

	// WSのURLが分かり次第接続開始
	useEffect(() => {
		if (session.wsEndpoint) {
			const ws = new WebSocket(session.wsEndpoint);

			ws.onopen = (event: any) => {
				console.log("ws open");
				console.info(event);
				setConnected(true);
			}

			ws.onmessage = (event: any) => {
				const body = JSON.parse(event.data);
				handleMessage(body);
			}

			ws.onerror = (event: any) => {
				console.log("ws error");
				console.error(event);
				setConnected(false);
			}

			ws.onclose = (event: any) => {
				console.log("ws closed");
				console.warn(event);
				setConnected(false);
			}

			let watchdog = setInterval(() => { // TODO: handle response
				ws.send(JSON.stringify({
					id: 5858,
					type: 'ping'
				}));
			}, 10000);

			return () => clearInterval(watchdog);
		}
	}, [session.wsEndpoint]);

	// useSessionで接続成功(userIDが取得された)したら追加の情報を取得
	useEffect(() => {
		if (session.userID) {
			const requestOptions = {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + session.userToken
				},
				body: `user=${session.userID}`
			};

			fetch(endpoint_getUserInfo, requestOptions)
				.then(response => response.json())
				.then(data => {
					if (data.ok) {
						setAvatar(data.user.profile.image_192);
					} else {
						console.error("get avatar failed. reason: " + data.error);
					}
				});

			fetch(endpoint_getChannels, {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + session.userToken
				},
				body: `user=${session.userID}&types=public_channel,private_channel&exclude_archived=true`
			})
			.then(response => response.json())
			.then(data => {
				data.channels.forEach((e: any) => channelDict.register(e.id, e));
				setChannels(data.channels.filter((e: any) => e.name.match(ChannelFilter.current))
					.map((e: any) => e.id)); // TODO: pagenate is required to get over 100 channels
			});

			if (ShowTestMessage) testMessage.forEach((e, i) => setTimeout(handleMessage, i*250, e));
		}
	}, [session.userID, ChannelFilter.current]);



	// =========================:: LOGICs ::===============================

	const slackify = (input: string): string => {
		return Emoji.emojify(
				toHTML(
					input.replace(/&gt;+/g, '>').replace(/&lt;+/g, '<').replace(/&amp;+/g, '&')
				),
				(key: string) => `<img src="${emojiDict.current[key]}" width="16px" height="16px"/>`
			);
	}

	const markAsRead = (channel: string, ts: string) => {
		fetch(endpoint_markAsRead, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': 'Bearer ' + session.userToken
			},
			body: `channel=${channel}&ts=${ts}`
		})
		.then(res => res.json())
		.then(data => {
			if (data.ok){
				// Do nothing ;)
			} else {
				console.error("failed to mark as read. reason:" + data.error);
			}
		});
	}


	// 着信メッセージ処理系

	const addMessage = async (e: RawRTMMessage) => {
		const channelName = (await channelDict.get(e.channel)).name;
		if (!channelName.match(ChannelFilter.current)) return;

		const datetime = new Date(parseFloat(e.ts) * 1000);
		const user = await userDict.get(e.user);
		const thumbnail = (e.files?.[0]?.thumb_480) ? await getProtectedImage(e.files?.[0]?.thumb_480) : undefined;
		const rec = {
			type: e.type,
			ts: e.ts,
			ts_number: parseFloat(e.ts),
			last_activity: parseFloat(e.ts),
			user: user.display_name,
			channel: channelName,
			channelID: e.channel,
			text: slackify(e.text),
			avatar: user.image_192,
			datetime: datetime.toLocaleString(),
			reactions: [],
			thread: [],
			parent: e.thread_ts,
			has_unloadedThread: false,
			attachmentThumbnail: thumbnail,
			attachmentURL: e.files?.[0]?.url_private
		};
		console.info("addMessage");
		messages.push(rec);
		if (AutoMarkRef.current) markAsRead(e.channel, e.ts);
	}


	const addReaction = (e: RawRTMMessage) => {
		console.info("addReaction");

		messages.update(old => {
			let update = [...old]; // TODO: should be rewrite
			const targetmsg = update.find(a => a.channelID == e.item.channel && a.ts == e.item.ts);
			if (targetmsg){
				const targetreaction = targetmsg.reactions.find(a => a.key == e.reaction);
				if (targetreaction) {
					targetreaction.count++;
				} else {
					targetmsg.reactions.push({
						key: e.reaction,
						count: 1
					});
				}
			}
			return update;
		});

	}

	const removeReaction = (e: RawRTMMessage) => {
		// TODO: TBI
	}

	const handleMessage = (body: any) => {
		switch (body.type) {
			case 'message':
				if (body.subtype && body.subtype != "thread_broadcast") return;
				addMessage(body);
				break;
			case 'reaction_added':
				addReaction(body);
				break;
			case 'reaction_removed':
				removeReaction(body);
				break;
			default:
			break;
		}
	}


	const getProtectedImage = async(path: string) => {
		const res = await fetch(path, {
			method: 'POST',
			headers: {
				'authorization': 'Bearer ' + session.userToken
			},
		});
		const data = await res.blob();
		return URL.createObjectURL(data);
	}

	// 履歴取得系
	const hist2msg = async (e: any, channel: string, channelID: string) => {
		const datetime = new Date(parseFloat(e.ts) * 1000);
		const user = await userDict.get(e.user);
		const thumbnail = (e.files?.[0]?.thumb_480) ? await getProtectedImage(e.files?.[0]?.thumb_480) : undefined;

		return {
			type: e.type,
			ts: e.ts,
			ts_number: parseFloat(e.ts),
			last_activity: parseFloat(e.ts),
			user: user.display_name,
			channel: channel,
			channelID: channelID,
			text: slackify(e.text),
			avatar: user.image_192,
			datetime: datetime.toLocaleString(),
			parent: undefined,
			reactions: e.reactions?.map((reaction: any) => ({key: reaction.name, count: reaction.count})) ?? [],
			thread: [],
			has_unloadedThread: ('thread_ts' in e),
			attachmentThumbnail: thumbnail,
			attachmentURL: e.files?.[0]?.url_private
		};
	}

	const loadHistory = () => {

		messages.clear();

		channels.forEach(channelID => {
			fetch(endpoint_getHistory, {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + session.userToken
				},
				body: `channel=${channelID}&limit=${10}`
			})
			.then(res => res.json())
			.then(data => {
				if (data.ok){
					(async () => {
						const newmsg = await Promise.all(
							data.messages.map(
								(e: any) => hist2msg(e, channelDict.current[channelID].name, channelID)
							)
						);
						messages.concat(newmsg);
					})();
				} else {
					console.error("failed to history. reason:" + data.error);
				}
			});
		});
	}


	// =========================:: VIEW ::===============================


	return (<>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Settings 
				isOpen={openSetting}
				close={() => setOpenSetting(false)}
				filterSource={filterSource}
				setFilterSource={setFilterSource}
				autoMark={autoMark}
				setAutoMark={setAutoMark}
				/>
			<Box sx={{ display: 'flex', flexDirection: 'column' }}>
				<Menubar
					session={session}
					openSetting={() => setOpenSetting(true)}
					loadHistory={loadHistory} 
					userPref={{avatar: avatar, joinedChannels: channels}}
					connected={connected}
					></Menubar>
				<Box sx={{display: 'flex', flexGrow: 1}}>
					{ session.logined() ? 
						<Timeline ipc={ipcRenderer}
								  session={session}
								  messages={messages}
								  userDict={userDict}
								  channelDict={channelDict}
								  emojiDict={emojiDict.current}
								  userPref={{avatar: avatar, joinedChannels: channels}}/>
						:
						<Login ipc={ipcRenderer} session={session}></Login> }
				</Box>
			</Box>
		</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
