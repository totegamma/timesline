import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, List, Divider } from '@mui/material';
const Emoji = require('node-emoji');

import { TweetProps, Tweet, TweetWith1Reply, TweetWith2Reply, TweetWithMoreThan3Reply } from './Tweet'
import { IuseSession } from '../hooks/useSession';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { IuseObjectList } from '../hooks/useObjectList';
import { UserPref, Reaction, RTMMessage } from '../model';

const endpoint_getEmojiList = 'https://slack.com/api/emoji.list';
const endpoint_getPermalink = 'https://slack.com/api/chat.getPermalink';

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


	return (<>
		{(props.messages.current.length != 0) ?
		<Paper sx={{display: 'flex', flex: 1}}>
			<List sx={{flex: 1}}>
				{constructThread(props.messages.current).map(e =>
				<React.Fragment key={e.ts}>
					{(() => {
					switch (e.thread.length) {
						case 0:
							return <Tweet message={e} openExternal={openInSlack} openBrowser={(url: string) => props.ipc.send("openExternal", url)} emojiDict={emojiDict.current} />
						break;
						case 1:
							return <TweetWith1Reply message={e} openExternal={openInSlack} openBrowser={(url: string) => props.ipc.send("openExternal", url)} emojiDict={emojiDict.current} />
						break;
						case 2:
							return <TweetWith2Reply message={e} openExternal={openInSlack} openBrowser={(url: string) => props.ipc.send("openExternal", url)} emojiDict={emojiDict.current} />
						break;
						default:
							return <TweetWithMoreThan3Reply message={e} openExternal={openInSlack} openBrowser={(url: string) => props.ipc.send("openExternal", url)} emojiDict={emojiDict.current} />
						break;
					}
					})()}
					<Divider variant="inset" component="li" sx={{margin: '0 5px'}} />
				</React.Fragment>
				)}
			</List>
		</Paper>
		:
		<Box sx={{position: 'absolute', width: '100%', height: '0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
			<Paper elevation={5} sx={{mt: '50px', padding: '20px'}}>
				まだ空っぽです！　誰かが発言するとここに自動的に表示されます。<br/>
				もしくは、右上のメニューから履歴を強制的にロードすることもできます。<br/>
				(履歴のロードは連打するとAPI Rate Limitに引っかかる可能性があります。)
			</Paper>
		</Box>
		}
	</>);
}


