import './App.css';
import React, {useState} from 'react';
import {Provider} from 'urql';

import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {TouchBackend} from 'react-dnd-touch-backend';

import {BrowserRouter, Routes, Route, useParams} from 'react-router-dom';

import Chip from '@mui/material/Chip';
import {ThemeProvider, createTheme} from '@mui/material/styles';

import {Balance} from './Balance';
import {AuthUI, Logout} from './firebase';
import {SimpleAuth, removeUserData} from './SimpleAuth';
import {Dashboard} from './Dashboard';
import {TFTSet, TFTVersion} from './version';
import {gqlClient} from './gql';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const Plug = () => {
  return (
    <Chip
      sx={{
        position: 'fixed',
        left: 5,
        bottom: 5,
        display: {xs: 'none', md: 'flex'},
      }}
      onClick={() => window?.open('https://twitter.com/Gonzih')?.focus()}
      color="info"
      variant="outlined"
      label={`Set: ${TFTSet}, Patch: ${TFTVersion} — mortdogged.xyz by @Gonzih`}
    />
  );
};

function App() {
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const [uid, setUID] = useState<string | null>(null);

  const logout = () => {
    Logout();
    removeUserData();
    setUID(null);
  };

  const balance = (
    <AuthUI onLoginChange={setUID}>
      <DndProvider backend={backend}>
        <Balance uid={uid} logout={logout} />
      </DndProvider>
    </AuthUI>
  );

  const simpleLoginBalance = (
    <SimpleAuth onLoginChange={setUID} uid={uid}>
      <DndProvider backend={backend}>
        <Balance uid={uid} logout={logout} />
      </DndProvider>
    </SimpleAuth>
  );

  const dashboard = (
    <AuthUI onLoginChange={setUID}>
      <DndProvider backend={backend}>
        <Dashboard uid={uid} logout={logout} />
      </DndProvider>
    </AuthUI>
  );

  const simpleLoginDashboard = (
    <SimpleAuth onLoginChange={setUID} uid={uid}>
      <DndProvider backend={backend}>
        <Dashboard uid={uid} logout={logout} />
      </DndProvider>
    </SimpleAuth>
  );

  const view = (
    <DndProvider backend={backend}>
      <Balance uid={uid} logout={() => {}} />;
    </DndProvider>
  );

  return (
    <Provider value={gqlClient}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={balance} />
            <Route path="/letmein" element={simpleLoginBalance} />
            <Route path="/food-fight-tactics" element={dashboard} />
            <Route path="/view/:viewUserId" element={view} />
            <Route
              path="/simple-food-fight-tactics"
              element={simpleLoginDashboard}
            />
          </Routes>
        </BrowserRouter>

        <Plug />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
