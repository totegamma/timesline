import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Modal, Divider, TextField, Button, Snackbar } from '@mui/material';
import MuiAlert, { AlertProps, AlertColor } from '@mui/material/Alert';
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
	filterSource: string;
	updateFilter: (regexp: RegExp, source: string) => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps> (
	function Alert(props, ref, ) {
			return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
	}
);

export const Settings = (props: SettingsProp) => {

	const [open, SetOpen] = useState<boolean>(false);
	const [tipMessage, SetTipMessage] = useState<string>("");
	const [tipServerity, SetTipServerity] = useState<AlertColor>("success");

	const [filterEdit, SetFilterEdit] = useState<string>(props.filterSource);

	const handleClick = () => {

		props.updateFilter(new RegExp(filterEdit), filterEdit);

		SetTipMessage("Filter updated successfully.");
		SetTipServerity("success");
		SetOpen(true);
	};

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		SetOpen(false);
	};

	return (
		<Modal
			open={props.isOpen}
			onClose={props.close}
		>
			<>
			<Paper sx={style}>
				<List
					sx={{width: '100%'}}
					subheader={<ListSubheader>Settings</ListSubheader>}
				>
					<ListItem>
						<ListItemText primary="ChannelFilter" sx={{flex: 1}}/>
						<Box sx={{display: 'flex', flex: 2, flexDirection: 'column', gap: 1}}>
							<TextField
								multiline
								label="regexp"
								rows={2}
								value={filterEdit}
								onChange={e => SetFilterEdit(e.target.value)}
							/>
							<Button variant="contained" onClick={handleClick}>Apply</Button>
						</Box>
					</ListItem>
				</List>
			</Paper>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
				<Alert onClose={handleClose} severity={tipServerity} sx={{ width: '100%' }}>
					{tipMessage}
				</Alert>
			</Snackbar>
			</>
		</Modal>
	);

}


