import './App.css';
import React, {useState} from 'react';
import { Balance } from './Balance';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend'

import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthUI } from './firebase';
import { Dashboard } from './Dashboard';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function isTouchDevice(): boolean {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

function App() {
    const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
    const [uid, setUID] = useState<string | null>(null);

    return (
        <ThemeProvider theme={darkTheme}>
            <AuthUI onLoginChange={setUID}>
                <DndProvider backend={backend}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Balance uid={uid} />} />
                            <Route path="food-fight-tactics" element={<Dashboard uid={uid} />} />
                        </Routes>
                    </BrowserRouter>
                </DndProvider>
            </AuthUI>
        </ThemeProvider>
    );
}

export default App;
