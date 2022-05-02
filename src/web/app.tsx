import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Paper, Box, AppBar, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Menubar } from './components/Menubar';
import { Timeline } from './components/Timeline';
import { Login } from './components/Login';
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

	const session: IuseSession = useSession();

	return (<>
		<CssBaseline />
		<ThemeProvider theme={darkTheme}>
			<Paper square sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Menubar {...{session: session}}></Menubar>
				<Box sx={{flexGrow: 1}}>
					{ session.logined() ? 
						<Timeline {...{session: session}}></Timeline> 
						: <Login {...{ipc: ipcRenderer, session: session}}></Login> }
				</Box>
			</Paper>
		</ThemeProvider>
	</>);
};


ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
);
