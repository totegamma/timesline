import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';

import { IuseSession } from '../hooks/useSession';


const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';

interface Reaction {
	key: string;
	count: number;
	image: string;
}

interface RawRTMMessage {
	type: string;
	ts: string;
	user: string;
	channel: string;
	text: string;
	reaction: string;
	item: any;
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
	datetime: string;
	reactions: Reaction[];
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
		text: 'メッセージ2'
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
]

export interface TimelineProps {
	session: IuseSession
}

export function Timeline(props: TimelineProps) {

	const [messages, setMessages] = useState<RTMMessage[]>([]); // TODO: should be custom hook

	const [userDict, setUserDict] = useState<{ [id: string]: any}>({});
	const [channelDict, setChannelDict] = useState<{ [id: string]: any}>({});



	const ResolveUser = async (id: string) => {

		if (id in userDict) {
			console.log("resolve user from cache");
			return userDict[id];
		} else {
			console.log("resolve user from API");
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
				console.log("resolve user failed. reason: " + data.error);
				return {};
			}

			userDict[id] = data.user.profile;
			setUserDict(userDict);

			return data.user.profile;
		}

	}

	const ResolveChannel = async (id: string) => {

		if (id in channelDict) {
			console.log("resolve channel from cache");
			return channelDict[id];
		} else {
			console.log("resovle channel from API");
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

			//console.log(data);

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
			reactions: []
		};
		console.log("addMessage");
		setMessages((old) => [...old, rec].sort((a, b) => b.ts_number - a.ts_number)); // TODO: replace sort to splice
	}


	const addReaction = (e: RawRTMMessage) => {
		console.log("addReaction");

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
		testMessage.forEach((e, i) => setTimeout(handleMessage, i*250, e));
	}, []);


	useEffect(() => {
		console.log("re-rendered!");
	});



	return (
		<List>
			{messages.map(e =>
			<React.Fragment key={e.ts}>
				<ListItem sx={{alignItems: 'flex-start'}}>
					<Box sx={{width: '48px', mr: '12px'}}>
						<Avatar alt="Profile Picture" src={e.avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
					</Box>
					<Box>
						<Box>
							<Typography component="span" sx={{fontWeight: '700'}}>{e.user}</Typography>
							<Typography component="span" sx={{fontWeight: '400'}}>
								{" #" +  e.channel + "・" + e.datetime}
							</Typography>
						</Box>
						<Box>
							<Typography>
								{e.text}
							</Typography>
						</Box>
						<Box sx={{flexDirection: 'row'}}>
							{e.reactions.map((data) => 
								<Chip
									key={data.key}
									size='small'
									label={`${data.key} x ${data.count}`}
									sx={{mr: '5px', mt: '5px'}}
								/>
							)}
						</Box>
					</Box>
				</ListItem>
				<Divider variant="inset" component="li" />
			</React.Fragment>
			)}
		</List>
	);
}


