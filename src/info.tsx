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

import { TFTSet, TFTVersion } from './version';

export const Info = () => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <Dialog
                onClose={handleClose}
                open={open}
            >
                <DialogTitle gutterBottom>
                    mortdogged.xyz
                </DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        Collecting data for Set {TFTSet} Patch {TFTVersion}
                    </Typography>
                    <Typography gutterBottom>
                        Feel free to send feedback, suggestions and error reports to <Link href="https://twitter.com/Gonzih" target="_blank">@Gonzih</Link> or <Link href="mailto:gonzih@gmail.com">email</Link>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            <IconButton size="large" onClick={handleClick}>
                <HelpIcon/>
            </IconButton>
        </>
    )
}
