import React, { useState } from 'react';
import { IuseSession } from '../hooks/useSession';


export interface LoginProps {
	ipc: any,
	session: IuseSession
}

export function Login(props: LoginProps) {

	const [oauthCode, setOauthCode] = useState("");

	return (<>
		<input type="button" value="click to open oauth" onClick={() => props.ipc.send("openExternal", props.session.oauthURL)}/><br/>
		<input type="text" value={oauthCode} onChange={e => setOauthCode(e.target.value)}/>
		<input type="button" value="submit" onClick={() => props.session.login(oauthCode)}/>
	</>);

}
