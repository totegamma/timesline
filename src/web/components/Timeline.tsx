import React, { useState, useEffect } from 'react';
import { Typography, Avatar } from '@mui/material';
import { List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';

import { IuseSession } from '../hooks/useSession';


const endpoint_getuserinfo = 'https://slack.com/api/users.info';

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
}

const testMessage : RTMMessage[] = [
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

	const [messages, setMessages] = useState<RTMMessage[]>([]);

	const addMessage = (e: RawRTMMessage) =>{

		const requestOptions = {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'authorization': 'Bearer ' + props.session.userToken
			},
			body: `user=${e.user}`
		};

		fetch(endpoint_getuserinfo, requestOptions)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				if (data.ok) {
					//setAccessToken(data.access_token);
					messages.push({
						type: e.type,
						ts: e.ts,
						user: data.user.profile.display_name,
						channel: e.channel,
						text: e.text
					});
					setMessages(messages);

				} else {
					console.log("getuserinfo failed. reason: " + data.error);
				}
			});

	}

	useEffect(() => {
		testMessage.forEach(e => addMessage(e));
	}, []);




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
						<Avatar alt="Profile Picture" />
					</ListItemAvatar>
					<ListItemText primary={e.user} secondary={e.text} />
				</ListItem>
				<Divider variant="inset" component="li" />
			</React.Fragment>
			)}
		</List>
	);
}

