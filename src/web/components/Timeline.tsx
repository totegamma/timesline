import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Chip, IconButton, StepConnector } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
const Emoji = require('node-emoji');

import { TweetProps, Tweet, TweetWith1Reply, TweetWith2Reply, TweetWithMoreThan3Reply } from './Tweet'
import { IuseSession } from '../hooks/useSession';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { IuseObjectList } from '../hooks/useObjectList';
import { UserPref, Reaction, RTMMessage, RawRTMMessage } from '../model';

import { testMessage } from '../resources/testItem';

const endpoint_getEmojiList = 'https://slack.com/api/emoji.list';
const endpoint_getPermalink = 'https://slack.com/api/chat.getPermalink';
const endpoint_getHistory = 'https://slack.com/api/conversations.history';


export interface TimelineProps {
	ipc: any,
	session: IuseSession,
	messages: IuseObjectList<RTMMessage>,
	userPref: UserPref,
	userDict: IuseResourceManager<any>,
	channelDict:IuseResourceManager<any>
}

export function Timeline(props: TimelineProps) {

	const emojiDict = useRef<{ [key: string]: string}>({});

	const addMessage = async (e: RawRTMMessage) =>{
		const datetime = new Date(parseFloat(e.ts) * 1000);
		const user = await props.userDict.get(e.user);
		const rec = {
			type: e.type,
			ts: e.ts,
			ts_number: parseFloat(e.ts),
			last_activity: parseFloat(e.ts),
			user: user.display_name,
			channel: (await props.channelDict.get(e.channel)).name ?? "ERROR",
			channelID: e.channel,
			text: e.text,
			avatar: user.image_192,
			datetime: datetime.toLocaleString(),
			reactions: [],
			thread: [],
			parent: e.thread_ts,
			has_unloadedThread: false
		};
		console.info("addMessage");
		//setMessages((old) => [...old, rec]);
		props.messages.push(rec);
	}


	const addReaction = (e: RawRTMMessage) => {
		console.info("addReaction");

		//setMessages(old => {
		props.messages.update(old => {
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
		console.warn('timeline loaded');

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

		//testMessage.forEach((e, i) => setTimeout(handleMessage, i*250, e));
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
		input.sort((a, b) => a.ts_number - b.ts_number)
		//console.log(input);
		for (var i in input) {
			if (input[i].parent) {
				const target = output.find(a => a.ts == input[i].parent);
				if (target) {
					target.last_activity = input[i].ts_number;
					target.thread.push(input[i]);
				} else {
					console.warn("thread resolve failed");
					input[i].has_unloadedThread = true;
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
		//console.log(output);
		return output;
	}


	return (
		<List sx={{flex: 1}}>
			{constructThread(props.messages.current).map(e =>
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


