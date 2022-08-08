import {TFTSetNumber} from './version';
import rawData from './data/en_us.json';

export const CurrentSet = `TFT_Set${TFTSetNumber}`;

export function icon2Src(folder: string, name: string): string {
  return `https://assets.mortdogged.xyz/${folder}/${name}`;
}

interface DataItem {
  name: string;
  icon: string;
  apiName: string;
  cost?: number;
}

interface RawData {
  items: Array<DataItem>;
  sets: {
    [key: number]: {
      champions: Array<DataItem>;
      traits: Array<DataItem>;
    };
  };
}

const data = rawData as unknown as RawData;

export const items = data.items
  .filter((item: DataItem) => !item.icon.includes('Augments/Hexcore'))
  .map((item: DataItem) => item.name || '');
export const augs = data.items
  .filter((item: DataItem) => item.icon.includes('Augments/Hexcore'))
  .map((item: DataItem) => item.name || '');

export const traits = data.sets[TFTSetNumber].traits.map(
  (item: DataItem) => item.name,
);

export const champs = data.sets[TFTSetNumber].champions.map(
  (item: DataItem) => item.name,
);

export const champ_cost: Record<string, number> = data.sets[
  TFTSetNumber
].champions.reduce((acc: Record<string, number>, item: DataItem) => {
  if (item && item.cost) {
    acc[item.name] = item.cost;
  }

  return acc;
}, {});
