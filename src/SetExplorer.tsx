import React, {useState} from 'react';

import RawData from './data/en_us.json';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function championIcon(apiName: string, setName: string): string {
  const an = apiName.toLowerCase();
  const sn = setName.toLowerCase();

  return `assets/characters/${an}/hud/${an}_square.${sn}.png`;
}

function icon2Src(icon: string): string {
  const prefix = 'https://raw.communitydragon.org/latest/game/';
  const ico = icon
    .toLowerCase()
    .replace('.dds', '.png')
    .replace('.tex', '.png');
  const src = `${prefix}${ico}`;

  return src;
}

const Item = (props: {item: any}) => {
  const {item} = props;

  return (
    <Box>
      <Paper>
        <Typography color="primary">
          {item['traits'] && item['apiName'] && (
            <img src={icon2Src(championIcon(item['apiName'], 'TFT_Set7'))} />
          )}
          {item['icon'] && <img src={icon2Src(item['icon'])} />}
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </Typography>
      </Paper>
    </Box>
  );
};

export const SetExplorer = () => {
  const [value, setValue] = useState('Items');

  const handleChange = (event: React.SyntheticEvent, tab: string) => {
    setValue(tab);
  };

  const allTabs = ['Items', 'Champions', 'Traits'];

  let items: Array<any> = RawData.items;
  if (value == 'Champions') {
    items = RawData.sets[7].champions;
  }
  if (value == 'Traits') {
    items = RawData.sets[7].traits;
  }

  return (
    <div>
      <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
        <Tabs value={value} onChange={handleChange} centered>
          {allTabs.map((tab) => (
            <Tab label={tab} value={tab} key={tab} />
          ))}
        </Tabs>
      </Box>

      {items.map((item) => (
        <Item item={item} />
      ))}
    </div>
  );
};
