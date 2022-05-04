import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField } from '@mui/material'

import { IuseSession } from '../hooks/useSession';

export interface LoginProps {
	ipc: any,
	session: IuseSession
}

export function Login(props: LoginProps) {

	const [oauthCode, setOauthCode] = useState("");

	return (
		<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1}}>
			<Paper elevation={5} sx={{p: '30px', display: 'flex', width: '500px', flexDirection: 'column', gap: '20px'}}>
				<Typography variant="h3">Login</Typography>
				<Typography>Step1. Get access token.</Typography>
				<Button variant="contained" onClick={() => props.ipc.send("openExternal", props.session.oauthURL)}>Get OAuth Code</Button>
				<Typography>Step2. Paste toke here.</Typography>
				<TextField label="code" variant="filled" value={oauthCode} onChange={e => setOauthCode(e.target.value)}/>
				<Button disabled={oauthCode == ""} variant="contained" onClick={() => props.session.login(oauthCode)}>Login</Button>
			</Paper>
		</Box>

	);

}

