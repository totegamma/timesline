import React, { useState, useEffect } from 'react';

const client_id = process.env.slack_client_id;
const client_secret = process.env.slack_client_secret;
const accessURL = 'https://slack.com/api/oauth.access';
const wsURL = 'https://slack.com/api/rtm.connect';
const endpoint_getUserInfo = 'https://slack.com/api/users.info';

export interface IuseSession {
	oauthURL: string;
	userToken: null | string;
	wsEndpoint: undefined | null | string;
	userID: undefined | string;
	avatar: undefined | string;
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
	const [avatar, setAvatar] = useState<undefined | string>();


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
					console.log(data);
					if (data.ok) {
						setAccessToken(data.access_token);
					} else {
						console.log("connection failed. reason: " + data.error);
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
						console.info(data.self.id);
						//setUsername(data.self.name);
					} else {
						console.log("connection failed. reason: " + data.error);
					}
				});
		}
	}, [accessToken]);

	useEffect(() => {
		if (userID) {
			const requestOptions = {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'authorization': 'Bearer ' + accessToken
				},
				body: `user=${userID}`
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
		}

	}, [userID]);

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
		avatar: avatar,
		login: login,
		logout: logout,
		logined:logined
	}

}


