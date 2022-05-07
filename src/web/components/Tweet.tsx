import React, {ReactNode} from 'react';
import { ListItem, Box, Avatar, Typography, IconButton, Link, Paper } from '@mui/material';

import { ReactionListProps, ReactionList } from './ReactionList';
import { Reaction, RTMMessage } from '../model';



export interface TweetProps {
	message: RTMMessage;
	openExternal: (channel: string, ts: string) => void;
	openBrowser: (url: string) => void;
	emojiDict: { [id:string]: string };
}


function Template(props: TweetProps & {children?: ReactNode}){
	return (
		<ListItem sx={{alignItems: 'flex-start', flex: 1}}>
			{props.children}
			<Box sx={{width: '48px', mr: '12px'}}>
				<Avatar alt="Profile Picture" src={props.message.avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
			</Box>
			<Box sx={{display: 'flex', flex: 1, flexDirection: 'column'}}>
				<Box>
					<Typography component="span" sx={{fontWeight: '700'}}>{props.message.user}</Typography>
					<Typography component="span" sx={{fontWeight: '400'}}>
						{` #${props.message.channel}・`}
						<Link component="button" underline="hover" color="inherit" onClick={() => props.openExternal(props.message.channelID, props.message.ts)}>
							{props.message.datetime}
						</Link>
					</Typography>
				</Box>
				<Box>
					<Typography sx={{overflowWrap: 'anywhere'}}>
						{props.message.text}
					</Typography>
				</Box>
				{(props.message.attachmentThumbnail) &&
					<Box component="img"
						 src={props.message.attachmentThumbnail}
						 onClick={() => (props.message.attachmentURL) && props.openBrowser(props.message.attachmentURL)}
						 sx={{mt: '8px', objectFit: 'cover', maxHeight: '400px', maxWidth: '400px', borderRadius: '16px', border: '1px solid #333', cursor: 'pointer'}}></Box>
				}
				<ReactionList reactions={props.message.reactions} emojiDict={props.emojiDict} />
			</Box>
		</ListItem>
	)
}

export function Tweet(props: TweetProps) {
	return (<>
		<Template {...props} />
		{props.message.has_unloadedThread &&
		<ListItem sx={{alignItems: 'flex-start', flex: 1}}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			</Box>
			<Box sx={{width: '48px', mr: '12px'}}></Box>
			<Link component="button" underline='hover' color='primary' onClick={() => props.openExternal(props.message.channelID, props.message.ts)}>
				このスレッドを表示
			</Link>
		</ListItem>
		}
	</>)
}

export function TweetWith1Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[0]} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}

export function TweetWith2Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[0]} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[1]} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}

export function TweetWithMoreThan3Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>

		<ListItem sx={{alignItems: 'flex-start', flex: 1}}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', flex: 1, border: '1.5px dashed #333639'}}></Box>
			</Box>
			<Box sx={{width: '48px', mr: '12px'}}></Box>
			<Link component="button" underline='hover' color='primary' onClick={() => props.openExternal(props.message.channelID, props.message.ts)}>
				返信をさらに表示
			</Link>
		</ListItem>

		<Template message={props.message.thread[props.message.thread.length-2]} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[props.message.thread.length-1]} openExternal={props.openExternal} openBrowser={props.openBrowser} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}
