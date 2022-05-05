import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, StepConnector } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
const Emoji = require('node-emoji');

import LaunchIcon from '@mui/icons-material/Launch';

import { Reaction, ReactionListProps, ReactionList } from './ReactionList';
import { IuseSession } from '../hooks/useSession';


const endpoint_getEmojiList = 'https://slack.com/api/emoji.list';
const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';
const endpoint_getPermalink = 'https://slack.com/api/chat.getPermalink';

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

interface RTMMessage {
	type: string;
	ts: string;
	ts_number: number;
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
		text: 'メッセージ1メッセージ1メッセージ1メッセージ1メッセージ1メッセージ1メッセージ1メッセージ1メッセージ1'
	},
	{
		type: 'message',
		ts: '1651292573.797390',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ2',
		thread_ts: '1651292573.797389'
	},
	{
		type: 'message',
		ts: '1651292573.797391',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ3'
	},
	{
		type: 'message',
		ts: '1651292573.797392',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ4'
	},
	{
		type: 'message',
		ts: '1651292573.797393',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ5'
	},
	{
		type: 'message',
		ts: '1651292573.797394',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ6'
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
		reaction: 'lisp',
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

	const [userDict, setUserDict] = useState<{ [id: string]: any}>({});
	const [channelDict, setChannelDict] = useState<{ [id: string]: any}>({});

	const [emojiDict, setEmojiDict] = useState<{ [key: string]: string}>({});


	const ResolveUser = async (id: string) => {

		if (id in userDict) {
			console.info("resolve user from cache");
			return userDict[id];
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

			userDict[id] = data.user.profile;
			setUserDict(userDict);

			return data.user.profile;
		}

	}

	const ResolveChannel = async (id: string) => {

		if (id in channelDict) {
			console.info("resolve channel from cache");
			return channelDict[id];
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

			channelDict[id] = data.channel;
			setChannelDict(channelDict);

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
			user: user.display_name,
			channel: (await ResolveChannel(e.channel)).name,
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
				setEmojiDict(data.emoji);
			} else {
				console.error("failed to get emoji list");
			}
		});

		testMessage.forEach((e, i) => setTimeout(handleMessage, i*250, e));
	}, []);


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
		for (var i = input.length-1; i >= 0; i--) {
			if (input[i].parent) {
				const target = output.find(a => a.ts == input[i].parent);
				if (target) target.thread.push(input[i]);
				else console.warn("thread resolve failed");
			} else {
				input[i].thread = [];
				output.push(input[i]);
			}
		}
		output.reverse();
		return output;
	}


	return (
		<List sx={{flex: 1}}>
			{constructThread(messages).map(e =>
			<React.Fragment key={e.ts}>
				<ListItem sx={{alignItems: 'flex-start', flex: 1}}>
					<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
						<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
						<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
					</Box>
					<Box sx={{width: '48px', mr: '12px'}}>
						<Avatar alt="Profile Picture" src={e.avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
					</Box>
					<Box sx={{display: 'flex', flex: 1, flexDirection: 'column', pr: '15px'}}>
						<Box>
							<Typography component="span" sx={{fontWeight: '700'}}>{e.user}</Typography>
							<Typography component="span" sx={{fontWeight: '400'}}>
								{` #${e.channel}・${e.datetime} (${e.thread.length})`}
							</Typography>
						</Box>
						<Box>
							<Typography>
								{e.text}
							</Typography>
						</Box>
						<ReactionList reactions={e.reactions} emojiDict={emojiDict} />
					</Box>
					<Box sx={{position: 'absolute', right: '5px', bottom: '6px'}}>
						<IconButton aria-label='open in slack' size='small' onClick={() => openInSlack(e.channelID, e.ts)}>
							<LaunchIcon fontSize="inherit" />
						</IconButton>
					</Box>
				</ListItem>
				<Divider variant="inset" component="li" />
			</React.Fragment>
			)}
		</List>
	);
}


