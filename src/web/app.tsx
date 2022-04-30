import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';

const ipcRenderer = (window as any).preload.ipcRenderer;
const client_id = process.env.slack_client_id;
const client_secret = process.env.slack_client_secret;
const oauthURL = 'https://slack.com/oauth/authorize?scope=client&client_id=' + client_id;
const accessURL = 'https://slack.com/api/oauth.access';
const wsURL = 'https://slack.com/api/rtm.connect';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#1976d2'
		}
	}
});

const App = () => {

	const [oauthCode, setOauthCode] = useState("");
	const [accessToken, setAccessToken] = useState<null | string>();
	const [wsEndpoint, setWsEndpoint] = useState<null | string>();

	const getToken = () => {
		if (oauthCode) {
			const requestOptions = {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				body: `client_id=${client_id}&client_secret=${client_secret}&code=${oauthCode}`
			};

			fetch(accessURL, requestOptions)
				.then(response => response.json())
				.then(data => {
					console.log(data);
					if (data.ok) {
						setAccessToken(data.access_token);
					} else {
						console.log("connection failed. reason: " + data.error);
					}
				});
		}
	}

	useEffect(() => {
		const savedToken = localStorage.getItem("access_token");
		if (savedToken) {
			setAccessToken(savedToken);
		}
	}, []);

	useEffect(() => {
		if (accessToken) {

			localStorage.setItem("access_token", accessToken);

			const requestOptions = {
				method: 'POST',
				headers: {
					'authorization': 'Bearer ' + accessToken
				}
			};

			fetch(wsURL, requestOptions)
				.then(response => response.json())
				.then(data => {
					console.log(data);
					if (data.ok) {
						setWsEndpoint(data.url);
					} else {
						console.log("connection failed. reason: " + data.error);
					}
				});
		}
	}, [accessToken]);

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


	return (<>
	<CssBaseline />
	<ThemeProvider theme={darkTheme}>
		<Paper square sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Menubar></Menubar>
			<input type="button" value="click to open oauth" onClick={() => ipcRenderer.send("openExternal", oauthURL)}/><br/>
			<input type="text" value={oauthCode} onChange={e => setOauthCode(e.target.value)}/>
			<input type="button" value="submit" onClick={getToken}/>
			<Box sx={{flexGrow: 1}}>
				<Timeline></Timeline>
			</Box>
		</Paper>
	</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
