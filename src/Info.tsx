import React, {useState} from 'react';

import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import {TFTSet, TFTVersion} from './version';

const InfoPopup = (props: {isOpen: boolean; handleClose: () => void}) => {
  const {isOpen, handleClose} = props;

  return (
    <Dialog onClose={handleClose} open={isOpen}>
      <DialogTitle gutterBottom>mortdogged.xyz</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Currently collecting data for Set {TFTSet} Patch {TFTVersion}
        </Typography>
        <Typography gutterBottom>
          Feel free to send feedback, suggestions and error reports to{' '}
          <Link href="https://twitter.com/Gonzih" target="_blank">
            @Gonzih
          </Link>{' '}
          or <Link href="mailto:gonzih@gmail.com">email</Link>
        </Typography>
        <Typography gutterBottom>
          This product isn't endorsed by Riot Games and doesn't reflect the
          views or opinions of Riot Games or anyone officially involved in
          producing or managing Riot Games properties. Riot Games, and all
          associated properties are trademarks or registered trademarks of Riot
          Games, Inc.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Info = () => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <InfoPopup isOpen={open} handleClose={handleClose} />
      <IconButton size="large" onClick={handleClick}>
        <HelpIcon />
      </IconButton>
    </>
  );
};

export const InfoMenu = (props: {logout: () => void}) => {
  const {logout} = props;
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
    setMoreMenuOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMoreMenuOpen(false);
  };

  const toggleMoreMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMoreMenuOpen((v) => !v);
    setMoreAnchorEl(e.currentTarget);
  };

  return (
    <>
      <InfoPopup isOpen={open} handleClose={handleClose} />
      <IconButton size="large" onClick={toggleMoreMenu}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        keepMounted
        open={moreMenuOpen}
        onClose={toggleMoreMenu}
        anchorEl={moreAnchorEl}
      >
        <MenuItem onClick={handleClick}>Info</MenuItem>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </>
  );
};
