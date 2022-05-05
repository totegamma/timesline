import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';
import { Login } from './components/Login';
import { useSession, IuseSession } from './hooks/useSession';
import { useResourceManager, IuseResourceManager } from './hooks/useResourceManager';

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

export interface UserPref {
	avatar: undefined | string;
	joinedChannels: string[];
}


const App = () => {

	const session: IuseSession = useSession();

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



	return (<>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Paper square sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Menubar session={session} userPref={{avatar: avatar, joinedChannels: channels}}></Menubar>
				<Box sx={{display: 'flex', flexGrow: 1}}>
					{ session.logined() ? 
						<Timeline ipc={ipcRenderer} session={session} userDict={userDict} channelDict={channelDict} userPref={{avatar: avatar, joinedChannels: channels}}></Timeline> 
						: <Login ipc={ipcRenderer} session={session}></Login> }
				</Box>
			</Paper>
		</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
