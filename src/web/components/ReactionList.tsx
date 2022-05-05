import React from 'react';
import {Box, Chip, Avatar, Typography, IconButton} from '@mui/material';

import { Reaction } from '../model';

const Emoji = require('node-emoji');

export interface ReactionListProps {
	reactions: Reaction[];
	emojiDict: { [id:string]: string };
}


export function ReactionList(props: ReactionListProps) {
	return (
		<Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
			<Box sx={{flex: 1}}>
				{props.reactions.map((data) =>
					<Chip
						key={data.key}
						size='small'
						avatar={
						<Avatar alt={data.key} src={props.emojiDict[data.key]} sx={{bgcolor: 'unset'}}>
							<Typography sx={{verticalAlign: 'middle'}}>
								{Emoji.get(data.key)}
							</Typography>
						</Avatar>}
						label={`${data.key} x ${data.count}`}
						sx={{mr: '5px', mt: '5px'}}
					/>
				)}
			</Box>
		</Box>

	)
}
