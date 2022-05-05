import React, {ReactNode} from 'react';
import { ListItem, Box, Avatar, Typography, IconButton, Link } from '@mui/material';

import LaunchIcon from '@mui/icons-material/Launch';

import { Reaction, ReactionListProps, ReactionList } from './ReactionList';
import { RTMMessage } from './Timeline';



export interface TweetProps {
	message: RTMMessage;
	openExternal: (channel: string, ts: string) => void;
	emojiDict: { [id:string]: string };
}


function Template(props: TweetProps & {children?: ReactNode}){
	return (
		<ListItem sx={{alignItems: 'flex-start', flex: 1}}>
			{props.children}
			<Box sx={{width: '48px', mr: '12px'}}>
				<Avatar alt="Profile Picture" src={props.message.avatar} sx={{marginTop: '5px', width: '48px', height: '48px'}} />
			</Box>
			<Box sx={{display: 'flex', flex: 1, flexDirection: 'column', pr: '15px'}}>
				<Box>
					<Typography component="span" sx={{fontWeight: '700'}}>{props.message.user}</Typography>
					<Typography component="span" sx={{fontWeight: '400'}}>
						{` #${props.message.channel}・${props.message.datetime}`}
					</Typography>
				</Box>
				<Box>
					<Typography>
						{props.message.text}
					</Typography>
				</Box>
				<ReactionList reactions={props.message.reactions} emojiDict={props.emojiDict} />
			</Box>
			<Box sx={{position: 'absolute', right: '5px', bottom: '6px'}}>
				<IconButton aria-label='open in slack' size='small' onClick={() => props.openExternal(props.message.channelID, props.message.ts)}>
					<LaunchIcon fontSize="inherit" />
				</IconButton>
			</Box>
		</ListItem>
	)

}


export function Tweet(props: TweetProps) {
	return (
		<Template {...props} />
	)
}

export function TweetWith1Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[0]} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}

export function TweetWith2Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[0]} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[1]} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}

export function TweetWithMoreThan3Reply(props: TweetProps) {
	return (<>
		<Template message={props.message} openExternal={props.openExternal} emojiDict={props.emojiDict}>
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
			<Link component="button" color='primary' onClick={() => props.openExternal(props.message.channelID, props.message.ts)} sx={{textDecoration: 'none'}}>
				返信をさらに表示
			</Link>
		</ListItem>

		<Template message={props.message.thread[props.message.thread.length-2]} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1, border: '1.5px solid #333639'}}></Box>
			</Box>
		</Template>
		<Template message={props.message.thread[props.message.thread.length-1]} openExternal={props.openExternal} emojiDict={props.emojiDict}>
			<Box sx={{position: 'absolute', left: '16px', top: '0', width: '48px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<Box sx={{width: '0', height: '38px', border: '1.5px solid #333639'}}></Box>
				<Box sx={{width: '0', flex: 1}}></Box>
			</Box>
		</Template>
	</>)

}
