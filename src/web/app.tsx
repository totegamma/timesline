import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';
import { Login } from './components/Login';
import { useSession, IuseSession } from './hooks/useSession';
import { useResourceManager, IuseResourceManager } from './hooks/useResourceManager';
import { useObjectList, IuseObjectList } from './hooks/useObjectList';

import { UserPref, RTMMessage } from './model';


const endpoint_getUserInfo = 'https://slack.com/api/users.info';
const endpoint_getChannelInfo = 'https://slack.com/api/conversations.info';
const endpoint_getChannels = 'https://slack.com/api/users.conversations';

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

	const session: IuseSession = useSession();
	//const [messages, setMessages] = useState<RTMMessage[]>([]);
	const messages = useObjectList<RTMMessage>();

	const [avatar, setAvatar] = useState<undefined | string>();
	const [channels, setChannels] = useState<string[]>([]);

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
				setChannels(data.channels.map((e: any) => e.id)); // TODO: pagenate is required to get over 100 channels
			});
		}
	}, [session.userID]);

	const hist2msg = async (e: any, channel: string, channelID: string) =>{
		const datetime = new Date(parseFloat(e.ts) * 1000);
		const user = await userDict.get(e.user);
		return {
			type: e.type,
			ts: e.ts,
			ts_number: parseFloat(e.ts),
			last_activity: parseFloat(e.ts),
			user: user.display_name,
			channel: channel,
			channelID: channelID,
			text: e.text,
			avatar: user.image_192,
			datetime: datetime.toLocaleString(),
			parent: undefined,
			reactions: e.reactions?.map((reaction: any) => ({key: reaction.name, count: reaction.count})) ?? [],
			thread: [],
			has_unloadedThread: ('thread_ts' in e)
		};
	}

/*
	useEffect(() => {
		if (props.userPref.joinedChannels) {
			props.userPref.joinedChannels.forEach(channelID => {
				//if (props.channelDict.current[channelID].name == "secrettest")
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
						(async () => {
							const newmsg = await Promise.all(
								data.messages.map(
									(e: any) => hist2msg(e, props.channelDict.current[channelID].name, channelID)
								)
							);
							setMessages((old: any) => [...old, ...newmsg]);
						})();
					} else {
						console.error("failed to history. reason:" + data.error);
					}
				});
			});
		}
	}, [props.userPref.joinedChannels]);
	*/



	return (<>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Paper square sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Menubar session={session} userPref={{avatar: avatar, joinedChannels: channels}}></Menubar>
				<Box sx={{display: 'flex', flexGrow: 1}}>
					{ session.logined() ? 
						<Timeline ipc={ipcRenderer}
								  session={session}
								  messages={messages}
								  userDict={userDict}
								  channelDict={channelDict} 
								  userPref={{avatar: avatar, joinedChannels: channels}}/>
						:
						<Login ipc={ipcRenderer} session={session}></Login> }
				</Box>
			</Paper>
		</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
