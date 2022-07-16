import './App.css';
import React from 'react';
import { Balance } from './Balance';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend'

import { ThemeProvider, createTheme } from '@mui/material/styles';

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

    return (
        <ThemeProvider theme={darkTheme}>
            <DndProvider backend={backend}>
                <Balance/>
            </DndProvider>
        </ThemeProvider>
    );
}

export default App;
