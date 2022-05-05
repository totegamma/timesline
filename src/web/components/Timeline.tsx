import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, StepConnector } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
const Emoji = require('node-emoji');

import { TweetProps, Tweet, TweetWith1Reply, TweetWith2Reply, TweetWithMoreThan3Reply } from './Tweet'
import { Reaction } from './ReactionList';
import { IuseSession } from '../hooks/useSession';
import { useResourceManager, IuseResourceManager } from '../hooks/useResourceManager';


const endpoint_getEmojiList = 'https://slack.com/api/emoji.list';
const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';
const endpoint_getPermalink = 'https://slack.com/api/chat.getPermalink';
const endpoint_getHistory = 'https://slack.com/api/conversations.history';

interface RawRTMMessage {
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
	parent: string;
	datetime: string;
	reactions: Reaction[];
	thread: RTMMessage[];
}

const testMessage : any[] = [
	{
		type: 'message',
		ts: '1651292573.797389',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。'
	},
	{
		type: 'message',
		ts: '1651292573.797390',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'イーハトーヴォへの最初の返信',
		thread_ts: '1651292573.797389'
	},
	{
		type: 'message',
		ts: '1651292573.797391',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'イーハトーヴォへの2番目の返信',
		thread_ts: '1651292573.797389'
	},
	{
		type: 'message',
		ts: '1651292573.797392',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'イーハトーヴォへの最後の返信',
		thread_ts: '1651292573.797389'
	},
	{
		type: 'message',
		ts: '1651292573.797393',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: '山路を登りながら、こう考えた。智に働けば角が立つ。情に棹させば流される。意地を通せば窮屈だ。とかくに人の世は住みにくい。住みにくさが高じると、安い所へ引き越したくなる。どこへ越しても住みにくいと悟った時、詩が生れて、画が出来る。'
	},
	{
		type: 'message',
		ts: '1651292573.7973935',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'イラレへの返信1',
		thread_ts: '1651292573.797393'
	},
	{
		type: 'message',
		ts: '1651292573.797394',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: '大人気ツイート'
	},
	{
		type: 'reaction_added',
		channel: 'U1EC1GLF7',
		reaction: 'heart',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
	{
		type: 'reaction_added',
		channel: 'U1EC1GLF7',
		reaction: 'thinking_face',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
	{
		type: 'reaction_added',
		channel: 'U1EC1GLF7',
		reaction: 'pray',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
	{
		type: 'reaction_added',
		channel: 'white_check_mark',
		reaction: 'thinking_face',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
	{
		type: 'reaction_added',
		channel: 'U1EC1GLF7',
		reaction: 'eyes',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
	{
		type: 'reaction_added',
		channel: 'U1EC1GLF7',
		reaction: 'slack',
		item: {
			ts: '1651292573.797394',
			channel: 'C03D2JHGC31'
		}
	},
]

export interface TimelineProps {
	ipc: any,
	session: IuseSession
}

export function Timeline(props: TimelineProps) {

	const [messages, setMessages] = useState<RTMMessage[]>([]); // TODO: should be custom hook

	const emojiDict = useRef<{ [key: string]: string}>({});
	//const userDict = useRef<{ [id: string]: object}>({});
	const channelDict = useRef<{ [id: string]: object}>({});

	const userDict = useResourceManager<object>(async (key: string) => {
			const res = await fetch(endpoint_getUserInfo, {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + props.session.userToken
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



	const ResolveUser = async (id: string) => {

		if (id in userDict.current) {
			return userDict.current[id];
		} else {
			console.info("resolve user from API");
			const requestOptions = {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + props.session.userToken
				},
				body: `user=${id}`
			};

			const res = await fetch(endpoint_getUserInfo, requestOptions);
			const data = await res.json();

			if (!data.ok) {
				console.error("resolve user failed. reason: " + data.error);
				return {};
			}

			userDict.current[id] = data.user.profile;

			return data.user.profile;
		}

	}

	const ResolveChannel = async (id: string) => {

		if (id in channelDict.current) {
			return channelDict.current[id];
		} else {
			console.info("resovle channel from API");
			const requestOptions = {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + props.session.userToken
				},
				body: `channel=${id}`
			};

			const res = await fetch(endpoint_getChannelInfo, requestOptions);
			const data = await res.json();

			channelDict.current[id] = data.channel;

			return data.channel;
		}


	}


	const addMessage = async (e: RawRTMMessage) =>{
		const datetime = new Date(parseFloat(e.ts) * 1000);
		const user = await ResolveUser(e.user);
		const rec = {
			type: e.type,
			ts: e.ts,
			ts_number: parseFloat(e.ts),
			last_activity: parseFloat(e.ts),
			user: user.display_name,
			channel: (await ResolveChannel(e.channel))?.name ?? "ERROR",
			channelID: e.channel,
			text: e.text,
			avatar: user.image_192,
			datetime: datetime.toLocaleString(),
			parent: e.thread_ts,
			reactions: [],
			thread: []
		};
		console.info("addMessage");
		setMessages((old) => [...old, rec].sort((a, b) => b.ts_number - a.ts_number)); // TODO: replace sort to splice
	}


	const addReaction = (e: RawRTMMessage) => {
		console.info("addReaction");

		setMessages(old => {
			let update = [...old]; // TODO: should be rewrite
			const targetmsg = update.find(a => a.channelID == e.item.channel && a.ts == e.item.ts);
			if (targetmsg){
				const targetreaction = targetmsg.reactions.find(a => a.key == e.reaction);
				if (targetreaction) {
					targetreaction.count++;
				} else {
					targetmsg.reactions.push({
						key: e.reaction,
						count: 1,
						image: ""
					});
				}
			}
			return update;
		});

	}

	const removeReaction = (e: RawRTMMessage) => {
	}

	const handleMessage = (body: any) => {
		switch (body.type) {
			case 'message':
				if (body.subtype) return;
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


	useEffect(() => {
		if (props.session.wsEndpoint) {
			const ws = new WebSocket(props.session.wsEndpoint);
			ws.onmessage = (event: any) => {
				const body = JSON.parse(event.data);
				handleMessage(body);
			}
		}
	}, [props.session.wsEndpoint]);


	useEffect(() =>  {


		const requestOptions = {
			method: 'POST',
			headers: {
				'authorization': 'Bearer ' + props.session.userToken
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


		testMessage.forEach((e, i) => setTimeout(handleMessage, i*250, e));
	}, []);

/*
	useEffect(() => {
		if (props.session.joinedChannels) {
			props.session.joinedChannels.forEach(channelID => {
				fetch(endpoint_getHistory, {
					method: 'POST',
					headers: {
						'content-type': 'application/x-www-form-urlencoded',
						'authorization': 'Bearer ' + props.session.userToken
					},
					body: `channel=${channelID}&limit=${10}`
				})
				.then(res => res.json())
				.then(data => {
					if (data.ok){
						console.log(data);
						//data.messages.forEach((e:any, i: number) => console.log(e));
						data.messages.forEach((e: any, i: number) => {
							e['channel'] = channelID;
							setTimeout(handleMessage, i*500, e);
						});
					} else {
						console.error("failed to history. reason:" + data.error);
					}
				});
			});
		}
	}, [props.session.joinedChannels]);
	*/


	useEffect(() => {
		console.info("re-rendered!");
	});

	const openInSlack = async (channelID: string, ts: string) => {
		const requestOptions = {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': 'Bearer ' + props.session.userToken
			},
			body: `channel=${channelID}&message_ts=${ts}`
		};

		const res = await fetch(endpoint_getPermalink, requestOptions);
		const data = await res.json();

		if (!data.ok) {
			console.error("get permalink failed. reason: " + data.error);
			return;
		}

		props.ipc.send("openExternal", data.permalink)
	}

	const constructThread = (input: RTMMessage[]) => {
		const output: RTMMessage[] = [];
		output.sort((a, b) => a.ts_number - b.ts_number)
		for (var i in input) {
			if (input[i].parent) {
				const target = output.find(a => a.ts == input[i].parent);
				if (target) {
					target.last_activity = input[i].ts_number;
					target.thread.push(input[i]);
				} else {
					console.warn("thread resolve failed");
					input[i].user = `(reply)${input[i].user}`;
					input[i].thread = [];
					input[i].last_activity = parseFloat(input[i].ts),
					output.push(input[i]);
				}
			} else {
				input[i].thread = [];
				input[i].last_activity = parseFloat(input[i].ts),
				output.push(input[i]);
			}
		}
		output.sort((a, b) => b.last_activity - a.last_activity)
		return output;
	}


	return (
		<List sx={{flex: 1}}>
			{constructThread(messages).map(e =>
			<React.Fragment key={e.ts}>
				{(() => {
				switch (e.thread.length) {
					case 0:
						return <Tweet message={e} openExternal={openInSlack} emojiDict={emojiDict.current} />
					break;
					case 1:
						return <TweetWith1Reply message={e} openExternal={openInSlack} emojiDict={emojiDict.current} />
					break;
					case 2:
						return <TweetWith2Reply message={e} openExternal={openInSlack} emojiDict={emojiDict.current} />
					break;
					default:
						return <TweetWithMoreThan3Reply message={e} openExternal={openInSlack} emojiDict={emojiDict.current} />
					break;
				}
				})()}
				<Divider variant="inset" component="li" sx={{margin: '0 5px'}} />
			</React.Fragment>
			)}
		</List>
	);
}


