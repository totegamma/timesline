import React, { useState, useEffect } from 'react';
import { Typography, Avatar } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';

import { IuseSession } from '../hooks/useSession';


const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';

interface RawRTMMessage {
	type: string;
	ts: string;
	user: string;
	channel: string;
	text: string;
}

interface RTMMessage {
	type: string;
	ts: string;
	user: string;
	channel: string;
	text: string;
	avatar: string;
}

const testMessage : RawRTMMessage[] = [
	{
		type: 'message',
		ts: '1651292573.797389',
		user: 'U1EC1GLF7',
		channel: 'C03D2JHGC31',
		text: 'メッセージ1'
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
	}
]

export interface TimelineProps {
	session: IuseSession
}

export function Timeline(props: TimelineProps) {

	const [messages, setMessages] = useState<RTMMessage[]>([]); // TODO: should be custom hook

	const [userDict, setUserDict] = useState<{ [id: string]: any}>({});
	const [channelDict, setChannelDict] = useState<{ [id: string]: any}>({});

	//const [state, dispatch] = useReducer(reducer,'初期値');


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

			//console.log(data);

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
		const user = await ResolveUser(e.user);
		const rec = {
			type: e.type,
			ts: e.ts,
			user: user.display_name,
			channel: (await ResolveChannel(e.channel)).name,
			text: e.text,
			avatar: user.image_192
		};
		console.log("addMessage");
		setMessages((old) => [...old, rec]);
	}

	useEffect(() =>  {
		testMessage.forEach((e, i) => setTimeout(addMessage, i*2000, e));
	}, []);


	useEffect(() => {
		console.log("re rendered!");
	});




	/*
	useEffect(() => {
		if (wsEndpoint) {
			const ws = new WebSocket(wsEndpoint);
			ws.onmessage = (event: any) => {
				const body = JSON.parse(event.data);
				console.log(body);
				if (body.envelope_id) {
					console.log("replied!");
					ws.send(JSON.stringify({envelope_id: body.envelope_id}));
				}
			};
		}
	}, [wsEndpoint]);
	*/




	return (
		<List>
			{messages.map(e =>
			<React.Fragment key={e.ts}>
				<ListItem alignItems="flex-start">
					<ListItemAvatar>
						<Avatar alt="Profile Picture" src={e.avatar} />
					</ListItemAvatar>
					<ListItemText primary={e.user} secondary={e.text} />
				</ListItem>
				<Divider variant="inset" component="li" />
			</React.Fragment>
			)}
		</List>
	);
}

