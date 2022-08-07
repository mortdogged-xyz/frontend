import {TFTSetNumber} from './version';
import RawData from './data/en_us.json';

export const CurrentSet = `TFT_Set${TFTSetNumber}`;

export function icon2Src(folder: string, name: string): string {
  return `https://assets.mortdogged.xyz/${folder}/${name}`;
}

export const SetData = {
  items: RawData.items.map((item) => item.name),
};
