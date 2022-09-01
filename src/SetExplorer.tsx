import React, {useState} from 'react';

import RawData from './data/en_us.json';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';

import {TFTSetNumber} from './version';
import {CurrentSet, iconFor} from './set_data';

import {Search} from './Search';

const Item = (props: {item: any; tab: string}) => {
  const {item, tab} = props;

  let folder = 'item';
  if (tab === 'Champions') {
    folder = 'champ';
  }
  if (tab === 'Traits') {
    folder = 'trait';
  }

  return (
    <Box>
      {item.name && (
        <Paper component="div">
          <Typography color="primary" component="span">
            <img src={iconFor(folder, item['name'])} />
            <Box>{item.desc}</Box>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export const SetExplorer = () => {
  const [value, setValue] = useState('Items');
  const [filter, setFilter] = useState('');

  const handleChange = (event: React.SyntheticEvent, tab: string) => {
    setValue(tab);
  };

  const allTabs = ['Items', 'Champions', 'Traits'];

  let items: Array<any> = RawData.items;
  if (value == 'Champions') {
    items = RawData.sets[TFTSetNumber].champions;
  }
  if (value == 'Traits') {
    items = RawData.sets[7].traits;
  }

  const matchesFilter = (thing: string | undefined) =>
    thing?.toLowerCase().includes(filter.toLowerCase());

  items = items.filter(
    (item) =>
      matchesFilter(item.name) ||
      matchesFilter(item.icon) ||
      matchesFilter(item.apiName) ||
      matchesFilter(item.desc),
  );

  return (
    <Box>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <Box component="span" sx={{maxWidth: 580}}>
              <Tabs value={value} onChange={handleChange} centered>
                {allTabs.map((tab) => (
                  <Tab label={tab} value={tab} key={tab} />
                ))}
              </Tabs>
            </Box>

            <Box component="span" sx={{maxWidth: 280}}>
              <Search placeholder={'Search...'} onChange={setFilter} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box>
        {items.map((item) => (
          <Item
            item={item}
            tab={value}
            key={`${item.id}${item.name}${item.apiName}`}
          />
        ))}
      </Box>
    </Box>
  );
};
