import React from 'react';
import { Balance } from './Balance';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend'

function isTouchDevice(): boolean {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
}

function App() {
    const backend = isTouchDevice() ? TouchBackend : HTML5Backend;

    return (
        <div className="App">
            <DndProvider backend={backend}>
                <Balance/>
            </DndProvider>
        </div>
    );
}

export default App;
