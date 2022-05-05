import React, { useState, useEffect } from 'react';

const client_id = process.env.slack_client_id;
const client_secret = process.env.slack_client_secret;
const accessURL = 'https://slack.com/api/oauth.access';
const wsURL = 'https://slack.com/api/rtm.connect';

export interface IuseSession {
	oauthURL: string;
	userToken: null | string;
	wsEndpoint: undefined | null | string;
	userID: undefined | string;
	login: (code: string) => void;
	logout: () => void;
	logined: () => boolean;
}


export function useSession(): IuseSession {

	const [oauthURL, setOauthURL] = useState("");
	const [oauthCode, setOauthCode] = useState("");
	const [accessToken, setAccessToken] = useState<null | string>(localStorage.getItem("access_token"));
	const [wsEndpoint, setWsEndpoint] = useState<null | string>();
	const [userID, setUserID] = useState<undefined | string>(undefined);

	useEffect(() => {
		setOauthURL('https://slack.com/oauth/authorize?scope=client&client_id=' + client_id);
	}, []);

	useEffect(() => {
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
					if (data.ok) {
						setAccessToken(data.access_token);
					} else {
						console.error("connection failed. reason: " + data.error);
					}
				});
		}
	}, [oauthCode]);

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
					if (data.ok) {
						setWsEndpoint(data.url);
						setUserID(data.self.id);
						//setUsername(data.self.name);
					} else {
						console.error("connection failed. reason: " + data.error);
					}
				});
		}
	}, [accessToken]);

	const login = (code: string) => {
		setOauthCode(code);
	}

	const logout = () => {
		setAccessToken(null);
		setWsEndpoint(null);
		localStorage.clear();
	}

	const logined = () => {
		return accessToken != null;
	}

	return {
		oauthURL: oauthURL,
		userToken: accessToken,
		wsEndpoint: wsEndpoint,
		userID: userID,
		login: login,
		logout: logout,
		logined:logined
	}

}


