import React, {useState} from 'react';

import RawData from './data/en_us.json';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {TFTSetNumber} from './version';
import {CurrentSet, icon2Src} from './set_data';

import {Search} from './Search';

const Item = (props: {item: any; tab: string}) => {
  const {item, tab} = props;

  let folder = 'item';
  if (tab === 'Champions') {
    folder = 'champion';
  }
  if (tab === 'Traits') {
    folder = 'trait';
  }

  return (
    <Box>
      <Paper component="div">
        <Typography color="primary" component="span">
          <img src={icon2Src(folder, item['name'])} />
          <Box>{item.desc}</Box>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </Typography>
      </Paper>
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
      <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
        <Tabs value={value} onChange={handleChange} centered>
          {allTabs.map((tab) => (
            <Tab label={tab} value={tab} key={tab} />
          ))}
        </Tabs>
      </Box>

      <Paper component="div" sx={{margin: '50px 60px'}}>
        <Search placeholder={'Search...'} onChange={setFilter} />
      </Paper>

      {items.map((item) => (
        <Item
          item={item}
          tab={value}
          key={`${item.id}${item.name}${item.apiName}`}
        />
      ))}
    </Box>
  );
};
