import React, {useState, useRef, useEffect} from 'react';
import firebase from 'firebase/compat/app';
import { getFirestore, setDoc, getDoc, doc } from "firebase/firestore";
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

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

export async function dbSet(version: string, uid: string, data: any) {
    await setDoc(doc(db, "feedback", "meta", version, uid), data)
}

export function dbGet(version: string, uid: string): Promise<any> {
    return getDoc(doc(db, "feedback", "meta", version, uid))
}

var uiConfig = {
    signInSuccessUrl: '/',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.GithubAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
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
    const [auth, setAuth] = useState(false);
    const rootEl = useRef(null);

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log(user);
                console.log(user.uid);
                setAuth(true);
                onLoginChange(user.uid);
            } else {
                setAuth(false);
                onLoginChange(null);
            }
        });
    }, []);

    useEffect(() => {
        if (rootEl.current) {
            var ui = firebaseui.auth.AuthUI.getInstance() ||
                     new firebaseui.auth.AuthUI(firebase.auth());
            ui.start(rootEl.current, uiConfig);
        }
    }, [rootEl]);

    return (
        <div>
            <div style={{display: auth ? 'none' : 'block'}} id='auth-root' ref={rootEl}></div>
            {auth ? children : <span></span>}
        </div>
    );
}
