import React, {useState, useRef, useEffect} from 'react';
import firebase from 'firebase/compat/app';
import { getFirestore, setDoc, getDoc, getDocs, doc, collection, query } from "firebase/firestore";
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

import Box from '@mui/material/Box';

import { Info } from './Info';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAzfysPhFcbMX1Nao97n6FV5pElJDhL8PA",
    authDomain: "tft-meta-73571.firebaseapp.com",
    projectId: "tft-meta-73571",
    storageBucket: "tft-meta-73571.appspot.com",
    messagingSenderId: "396966753051",
    appId: "1:396966753051:web:08f96ed782fbebc19c99be",
    measurementId: "G-11NJ6FYJQG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function dbSet(key: string, uid: string, data: any) {
    await setDoc(doc(db, "feedback", "meta", key, uid), {data: JSON.stringify(data)});
}

interface StoredData {
    data: string,
}

export async function dbGetAllFeedback(version: string): Promise<void> {
    const q = query(collection(db, "feedback", "meta", version));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((data) => {
        console.log(data);
    })

    return;
    /* throw new Error("Could not find data"); */
}

export async function dbGet<T>(version: string, uid: string): Promise<T> {
    const docRef = await getDoc(doc(db, "feedback", "meta", version, uid));
    if (docRef.exists()) {
        const data = docRef.data() as StoredData;
        return JSON.parse(data.data) as T;
    }

    throw new Error("Could not find data");
}

var uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
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
    privacyPolicyUrl: function() {
        window.location.assign('/');
    }
};

export async function Logout() {
    await firebase.auth().signOut();
}

export const AuthUI = (props: {
    children: JSX.Element|JSX.Element[],
    onLoginChange: (uid: string | null) => void,
}) => {
    const { children, onLoginChange } = props;
    const [firebaseInstance] = useState(firebaseui.auth.AuthUI.getInstance() ||
                                        new firebaseui.auth.AuthUI(firebase.auth()))
    const [isAuthed, setIsAuthed] = useState(false);
    const rootEl = useRef(null);

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
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
    )

    return (
        <>
            <Box sx={{display: (!isAuthed ? 'block' : 'none')}} component="div" ref={rootEl}></Box>
            {isAuthed ? children : <span></span>}
            {!isAuthed ? info : <span></span>}
        </>
    );
}
