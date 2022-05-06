import React, { useEffect } from 'react';
import { Box, Paper, Typography, Modal, Divider, TextField } from '@mui/material';
import { List, ListSubheader, ListItem, ListItemText } from '@mui/material';



const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 600,
};

export interface SettingsProp {
	isOpen: boolean;
	close: () => void;
}


export const Settings = (props: SettingsProp) => {

	return (
		<Modal
			open={props.isOpen}
			onClose={props.close}
		>
			<Paper sx={style}>
				<List
					sx={{width: '100%'}}
					subheader={<ListSubheader>Settings</ListSubheader>}
				>
					<ListItem>
						<ListItemText primary="ChannelFilter" />
						<TextField
							multiline
							label="(channelID) => boolean"
							rows={8}
						/>
					</ListItem>
				</List>
			</Paper>
		</Modal>
	);

}


