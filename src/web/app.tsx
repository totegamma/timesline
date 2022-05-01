import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';
import { useSession, IuseSession } from './hooks/useSession';

const ipcRenderer = (window as any).preload.ipcRenderer;

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#1976d2'
		}
	}
});

const App = () => {

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


	const [oauthCode, setOauthCode] = useState("");
	const session: IuseSession = useSession();


	return (<>
	<CssBaseline />
	<ThemeProvider theme={darkTheme}>
		<Paper square sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Menubar {...{session: session}}></Menubar>
			<Box sx={{flexGrow: 1}}>
			{session.logined() ?
				<Timeline></Timeline>
				:
				<Box>
					<input type="button" value="click to open oauth" onClick={() => ipcRenderer.send("openExternal", session.oauthURL)}/><br/>
					<input type="text" value={oauthCode} onChange={e => setOauthCode(e.target.value)}/>
					<input type="button" value="submit" onClick={() => session.login(oauthCode)}/>
				</Box>
			}
			</Box>
		</Paper>
	</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
