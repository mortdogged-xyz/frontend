import {TFTSetNumber} from './version';
import rawData from './data/en_us.json';

export const CurrentSet = `TFT_Set${TFTSetNumber}`;

export function icon2Src(folder: string, name: string): string {
  return `https://assets.mortdogged.xyz/${folder}/${name}`;
}

interface DataItem {
  name: string;
  desc?: string;
  icon: string;
  apiName: string;
  id?: number;
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

const blacklist = [
  'Ardent Censer',
  'At Odds',
  'Break Even',
  'Broken Stopwatch',
  'Cram Session',
  'Dominance',
  'Dual Rule',
  'Nomsy',
  'Jade Statue',
  'The Golden Egg',
  "Zoe's Daisy",
  'Woodland',
  'Academy',
  'Arcane',
  'Arcanist',
  "Archangel's",
  'Armor Plating',
  'Backfoot',
  'Soul',
  'Battlemage',
  'Bench Backup',
  'All For One',
  'Challenger',
  'Chemical',
  'Chemtech',
  'Concussive Blows',
  'Convergence',
  'Divine Intervention',
  'Disintegrator',
  'Duet',
  'En Garde',
  'Greater Allegiance',
  'Hexnova',
  'Hextech Unity',
  'Huge-ification',
  'Hustler',
  "Knife's Edge",
  'Lifelong Learning',
  'Instant Injection',
  'Irresistible',
  'Junkyard',
  'Keepers',
  'March of Progress',
  'Overpower',
  'One For All',
  'Partners United',
  'Payday',
  'Phalanx',
  'Pirates',
  'Profit Sharing',
  'Runic Shield',
  'Scoped Weapons',
  'Rascals',
  'Very VIP',
  'Unstable Evolution',
  'True Justice',
  'Treasure Trove',
  'Titanic Force',
  'Tinker',
  'Stored Power',
  'Stand Behind Me',
  'So Small',
  'Spell Blade',
  "Sniper's Nest",
  'Smoke Bomb',
  'Sharpshooter',
  'Share-o-sel',
  'Share the Spotlight',
  'Self Repair',
  'Striker',
  'Hextech Crown',

  // ITEMS
  'Unusable Slot',
  'MountainHexBuff',
  'Three tier',
  'Two tier',
  'One tier',
  'Special item',
  'Astral Emblem',
];

const whitelist = [
  'OrnnItem',
  'Radiant',
  'Shimmerscale',
  'Morello',
  'Zeke',
  'Crown',
  'Rabadon',
  'Infinity_Edge',
  'Frozen_Heart',
  'Shroud_of_Stillnes',
  'Redemption',
  'Zephyr',
  "Thiefe's Gloves",
  'Guinsoo',
  'Ionic_Spark',
  'Dragons_Claw',
  'Trap_Claw',
  'Blue_Buff',
  'Chain_Vest',
  'BF_Sword',
  'Stoneplate',
  'Bramble',
  'Giant_Slayer',
  'Sunfire_Cape',
  'Hand_of_Justice',
  'Edge_Of_Night',
  'Death_Blade',
  'Negatron',
  'Titans_Resolve',
  'Runaans',
  'Sparring_Gloves',
  'Bloodthirster',
  'ArchangelsStaff',
  'ZZRot',
  'Shojin',
  'Solari',
  'Rapid_Fire_Cannon',
  'Last_Whisper',
  'Jeweled_Guantlet',
  'Gaints_Belt',
  'Needlessly_Large_Rod',
  'Quicksilver',
  'Chalice_of_Power',
  'Warmogs_Armor',
  'Statikk',
  'Thieves_Gloves',
  'Gunblade',
  'Recurve_Bow',
  'Tear_of_the_Goddess',
];

function offBlacklist(item: DataItem) {
  return !blacklist.some((bl) => item.name?.includes(bl));
}

function onWhitelist(item: DataItem) {
  return whitelist.some((wl) => item.icon.includes(wl));
}

const data = rawData as unknown as RawData;

export const traits = data.sets[TFTSetNumber].traits
  .filter(offBlacklist)
  .map((item: DataItem) => item.name);

export const items = data.items
  .filter(offBlacklist)
  .filter(
    (item: DataItem) =>
      !item.icon.includes('Augments/Hexcore') &&
      ((item.name?.includes('Emblem') &&
        traits.some((trait) => item.name?.includes(trait))) ||
        onWhitelist(item)),
  )
  .map((item: DataItem) => item.name || '');

export const augs = data.items
  .filter(offBlacklist)
  .filter(
    (item: DataItem) =>
      item.icon.includes(CurrentSet) ||
      (item.icon.includes('TFT_Set') &&
        !item.name?.includes('Heart') &&
        !item.name?.includes('Crest') &&
        !item.name?.includes('Crown')) ||
      onWhitelist(item) ||
      traits.some((trait) => item.icon.includes(trait)),
  )
  .filter((item: DataItem) => item.icon.includes('Augments/Hexcore'))
  .map((item: DataItem) => item.name || '');

export const champs = data.sets[TFTSetNumber].champions
  .filter(offBlacklist)
  .map((item: DataItem) => item.name);

export const champ_cost: Record<string, number> = data.sets[
  TFTSetNumber
].champions.reduce((acc: Record<string, number>, item: DataItem) => {
  if (item && item.cost) {
    acc[item.name] = item.cost;
  }

  return acc;
}, {});

const itemCostMapping: Record<string, number> = {
  Shimmerscale: 3,
  Ornn: 2,
  Emblem: 10,
  Radiant: 1,
};

export const item_cost: Record<string, number> = data.items.reduce(
  (acc: Record<string, number>, item: DataItem) => {
    const costK = Object.keys(itemCostMapping).find(
      (k) => item.icon.includes(k) || item.name?.includes(k),
    );

    const cost = costK ? itemCostMapping[costK] : 0;
    acc[item.name] = cost;

    return acc;
  },
  {},
);
