import React, {useState} from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { Info } from './Info';

const LoginForm = (props: {
    onSubmit: (email: string | null, password: string | null) => void,
}) => {
    const { onSubmit } = props;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit(data.get('email') as string | null, data.get('password') as string | null);
    };

    return (
        <>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            sx={{display: "none"}}
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Grid container display="none">
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </>
    );
}

export const SimpleAuth = (props: {
    children: JSX.Element|JSX.Element[],
    onLoginChange: (uid: string | null) => void,
}) =>  {
    const { children, onLoginChange } = props;
    const [isAuthed, setIsAuthed] = useState(false);

    const handleSubmit = (email: string | null, password: string | null) => {
        console.log({email, password});
        onLoginChange(null);
        setIsAuthed(false);
    }

    const info = (
        <Box component="div" sx={{position: 'absolute', top: '0', right: '0'}}>
            <Info />
        </Box>
    )

    return (
        <>
            {!isAuthed && <LoginForm onSubmit={handleSubmit} />}
            {isAuthed && children}
            {!isAuthed && info}
        </>
    );
}
