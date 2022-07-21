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

import Chip from '@mui/material/Chip';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthUI } from './firebase';
import { Dashboard } from './Dashboard';
import { TFTSet, TFTVersion } from './version';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function isTouchDevice(): boolean {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

const Plug = () => {
    return (
        <Chip sx={{
            position: 'fixed',
            left: 5,
            bottom: 5,
            display: { xs: 'none', md: 'flex' },
        }}
              label={`set ${TFTSet}, patch ${TFTVersion} — mortdogged.xyz by @Gonzih`}
        />
    )
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
            <Plug />
        </ThemeProvider>
    );
}

export default App;
