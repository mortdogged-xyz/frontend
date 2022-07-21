import React, {useState} from 'react';

import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';

import { Info } from './Info';

export const SimpleAuth = (props: {
    children: JSX.Element|JSX.Element[],
    onLoginChange: (uid: string | null) => void,
}) => {
    const { children, onLoginChange } = props;
    const [isAuthed, setIsAuthed] = useState(false);

    const info = (
        <Box component="div" sx={{position: 'absolute', top: '0', right: '0'}}>
            <Info />
        </Box>
    )

    return (
        <>
            <Card sx={{width: '350px'}}>
                <Box sx={{
                    display: (!isAuthed ? 'flex' : 'none'),
                    
                }}
                     flexDirection="column"
                     component="div"
                >
                    <FormControl>
                        <InputLabel htmlFor="email-input">Email address</InputLabel>
                        <Input id="email-input" aria-describedby="email-text" type="email" />
                        <FormHelperText id="email-text">We'll never share your email.</FormHelperText>
                    </FormControl>

                    <FormControl>
                        <InputLabel htmlFor="pass-input">Password</InputLabel>
                        <Input id="pass-input" aria-describedby="password-text" type="email" />
                        <FormHelperText id="password-text">Password recovery isn't functioning right now, sorry :(</FormHelperText>
                    </FormControl>
                </Box>
            </Card>
            {isAuthed ? children : <span></span>}
            {!isAuthed ? info : <span></span>}
        </>
    );
}
