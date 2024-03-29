import React, {useState, useRef, useEffect} from 'react';
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

import {useNavigate} from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import EmailIcon from '@mui/icons-material/Email';

import {Info} from './Info';
import {Alert} from './Alert';
import {isFirefox} from './browser';
import {getUserData, setUserData, removeUserData} from './SimpleAuth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAzfysPhFcbMX1Nao97n6FV5pElJDhL8PA',
  authDomain: 'tft-meta-73571.firebaseapp.com',
  projectId: 'tft-meta-73571',
  storageBucket: 'tft-meta-73571.appspot.com',
  messagingSenderId: '396966753051',
  appId: '1:396966753051:web:08f96ed782fbebc19c99be',
  measurementId: 'G-11NJ6FYJQG',
};
firebase.initializeApp(firebaseConfig);

interface SavedData<T> {
  data: T;
  version: number;
  loginSource: string;
}

const uiConfig = {
  signInSuccessUrl: document.location.href || '/',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '/',
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign('/');
  },
};

export async function Logout() {
  await firebase.auth().signOut();
}

export const FirefoxWarning = (props: {loggedIn: boolean}) => {
  const {loggedIn} = props;
  const [visible, setVisible] = useState(isFirefox);

  return (
    <Box
      component="div"
      display={visible && !loggedIn ? 'flex' : 'none'}
      justifyContent="center"
      alignItems="center"
      sx={{
        margin: '10px',
      }}
    >
      <Alert
        sx={{width: '300px'}}
        severity="warning"
        onClose={() => setVisible(false)}
      >
        <Typography>
          Firefox users might experience problems with logging in.
        </Typography>
        <Typography fontWeight="bold">
          Try registering with email and password instead of using Google or
          Twitter authentication.
        </Typography>
      </Alert>
    </Box>
  );
};

export const AuthUI = (props: {
  children: JSX.Element | JSX.Element[];
  onLoginChange: (uid: string | null) => void;
}) => {
  const {children, onLoginChange} = props;
  const [firebaseInstance] = useState(
    firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(firebase.auth()),
  );
  const [isAuthed, setIsAuthed] = useState(false);
  const rootEl = useRef(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const token = await user.getIdToken();
        const ts = Date.now();
        const email = user.email;

        setUserData({uid, email, token, ts});
      } else {
        const userData = getUserData();
        if (!userData) {
          removeUserData();
        }
      }

      onLoginChange(user?.uid || null);
      setIsAuthed(!!user);
    });
  }, [firebaseInstance, onLoginChange]);

  useEffect(() => {
    if (rootEl.current) {
      firebaseInstance.start(rootEl.current, uiConfig);
    }
  }, [firebaseInstance, rootEl]);

  const info = (
    <Box component="div" sx={{position: 'absolute', top: '0', right: '0'}}>
      <Info />
    </Box>
  );

  const navigate = useNavigate();

  return (
    <>
      <FirefoxWarning loggedIn={isAuthed} />

      <Box
        sx={{
          display: !isAuthed ? 'block' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '20px',
        }}
        component="div"
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<EmailIcon />}
          onClick={() => navigate('/letmein')}
          sx={{
            textTransform: 'none',
            width: '220px',
          }}
        >
          Sign in with email
        </Button>
        <Box component="div" ref={rootEl}></Box>
      </Box>
      {isAuthed ? children : <span></span>}
      {!isAuthed ? info : <span></span>}
    </>
  );
};
