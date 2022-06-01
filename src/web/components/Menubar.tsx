import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { AppBar, Toolbar, Icon } from '@mui/material';
import { Menu, MenuItem, Tooltip, IconButton, Avatar, Divider, ListItemIcon, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

import { ReactComponent as Logo } from '../resources/logo.svg';

import { IuseSession } from '../hooks/useSession';
import { UserPref } from '../model';


export interface MenubarProps {
	session: IuseSession;
	userPref: UserPref;
	loadHistory: () => void;
	openSetting: () => void;
	connected: boolean;
}

export function Menubar(props: MenubarProps) {

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (<>
		<AppBar>
			<Toolbar sx={{display: 'flex'}}>
				<Icon sx={{width: '40px', height: '40px', mr: '10px'}}>
				<Logo/>
				</Icon>
				<Typography variant="h4" sx={{flex: 1}}>Timesline</Typography>
				{props.session.logined() &&
				<Tooltip title="Settings">
					<IconButton
					onClick={handleClick}
					size="small"
					sx={{ ml: 2 }}
					aria-controls={open ? 'account-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					>
					<StyledBadge
						overlap="circular"
						anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
						variant="dot"
						invisible={props.connected}
					>
						<Avatar src={props.userPref.avatar} sx={{ width: 32, height: 32 }}></Avatar>
					</StyledBadge>

					</IconButton>
				</Tooltip>
				}
			</Toolbar>
		</AppBar>
		<Toolbar/>
		<Menu
			anchorEl={anchorEl}
			id="account-menu"
			open={open}
			onClose={handleClose}
			onClick={handleClose}
			PaperProps={{
				elevation: 0,
				sx: {
					overflow: 'visible',
					filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
					mt: 1.5,
					'& .MuiAvatar-root': {
						width: 32,
						height: 32,
						ml: -0.5,
						mr: 1,
					},
					'&:before': {
						content: '""',
						display: 'block',
						position: 'absolute',
						top: 0,
						right: 14,
						width: 10,
						height: 10,
						bgcolor: 'background.paper',
						transform: 'translateY(-50%) rotate(45deg)',
						zIndex: 0,
					},
				},
			}}
			transformOrigin={{ horizontal: 'right', vertical: 'top' }}
			anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
		>

			<MenuItem onClick={props.loadHistory}>
				<ListItemIcon>
					<HistoryIcon fontSize="small" />
				</ListItemIcon>
				LoadHistory
			</MenuItem>
			<Divider/>
			<MenuItem onClick={props.openSetting}>
				<ListItemIcon>
					<SettingsIcon fontSize="small" />
				</ListItemIcon>
				Settings
			</MenuItem>
			<Divider/>
			<MenuItem onClick={() => props.session.logout()}>
				<ListItemIcon>
					<LogoutIcon fontSize="small" />
				</ListItemIcon>
				Logout
			</MenuItem>
		</Menu>
	</>);
}

const StyledBadge = styled(Badge)(({ theme }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: 'red',
		color: 'red',
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
			'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			border: '1px solid currentColor',
			content: '""',
		},
	}
}));
