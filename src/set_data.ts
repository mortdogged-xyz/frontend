import {TFTSetNumber, CDragonVersion} from './version';
import rawData from './data/en_us.json';

export const CurrentSet = `TFT_Set${TFTSetNumber}`;

interface DataItem {
  name: string;
  desc?: string;
  icon: string;
  apiName: string;
  id?: number;
  cost?: number;
}

interface SetData {
  champions: Array<DataItem>;
  traits: Array<DataItem>;
  number: number;
  name: string;
  mutator: string;
}

interface RawData {
  items: Array<DataItem>;
  setData: Array<SetData>;
}

const blacklist = [
  'Ardent Censer',
  'At Odds',
  'Break Even',
  'Broken Stopwatch',
  'Cram Session',
  'Dominance',
  'Dual Rule',
  'Jade Statue',
  'The Golden Egg',
  "Zoe's Daisy",
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
  // 'Scoped Weapons',
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

  // Midset changes
  'Ragewing Emblem',
  'Assasin Crest',
  'High Roller',
  'Makeshift Armor',
  'Meditation',
  'Phony Frontline',
  'Dragon Horde',
  'Dragon Alliance',
  'Seastone',
  'NomsyMage',
  'NomsyEvoker',
  'NomsyCannoneer',
  'Whispers Emblem',
  'Dragonmancer Conference',
  'Mage Conference',
  'Part-Time Assassin',

  // Champs SET 8
  'Archive Of Augments',
  'Mercenary Chest',
  'Giant Crabgot',
  'Mutant Zac',
  'Target Dummy',
  'Volcanic Sol',
  'Hackerim',

  // SET 8 blocked stuff
  'Shimmerscale',
  'Swiftshot',
  'Revel',
  'Mirage',
  'Lagoon',
  'Guild',
  'Bruiser',
  'Cannoneer',
  'Cavalier',
  'Dragon',
  'Evoker',
  'Mage',
  'Ragewing',
  'Tempest',
  'Whispers',
  'Dragonmancer',
  'Debonair',
  'Darkflight',
  'Jade',
  'Scalescorn',
  'Shapeshifter',
  'Warrior',
  'Guardian',
];

const whitelist = [
  'OrnnItem',
  'Radiant',
  'Morello',
  'Zeke',
  'Crown',
  'Rabadon',
  'Infinity_Edge',
  "Protector's Vow",
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

  // Midset
  'Winters_Approach',
  'Lucky Gloves',
  'Birthday Present',

  // SET 8
  'Stridebreaker',
];

function offBlacklist(item: DataItem) {
  return (
    !blacklist.some(
      (bl) => item.name?.includes(bl) || item.apiName?.includes(bl),
    ) || item.icon?.includes('SoulSiphon')
  );
}

function onWhitelist(item: DataItem) {
  return whitelist.some((wl) => item.icon.includes(wl));
}

function championAug(item: DataItem, champions: Array<string>) {
  return champions.some((champ) =>
    item.apiName?.includes(`Augment_${champ}Carry`),
  );
}

function traitAug(item: DataItem, traits: Array<string>) {
  return traits.some(
    (trait) =>
      ['Heart', 'Crest', 'Crown'].some((mod) => item.name?.includes(mod)) &&
      item.apiName?.includes(`Augment_${trait}`),
  );
}

const data = rawData as unknown as RawData;
const setData: SetData = data.setData.find(
  (data) => data.number === TFTSetNumber,
)!;

export const traits = setData.traits
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

export const champs = setData.champions
  .filter(offBlacklist)
  .map((item: DataItem) => item.name);

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
      traitAug(item, traits),
  )
  .filter(
    (item: DataItem) =>
      item.icon.includes('Augments/Hexcore') || championAug(item, champs),
  )
  .map((item: DataItem) => item.apiName || '');

export const champ_cost: Record<string, number> = setData.champions.reduce(
  (acc: Record<string, number>, item: DataItem) => {
    if (item && item.cost) {
      acc[item.name] = item.cost;
    }

    return acc;
  },
  {},
);

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

interface Mappings {
  items: Record<string, string>;
  traits: Record<string, string>;
  championsL: Record<string, string>;
  champions: Record<string, string>;
}

function toMappings(
  acc: Record<string, string>,
  item: DataItem,
): Record<string, string> {
  const icon = icon2Src(item.icon);
  acc[item.name?.toLowerCase()] = icon;
  acc[item.apiName?.toLowerCase()] = icon;

  return acc;
}

function toMappingsChamp(acc: Record<string, string>, item: DataItem) {
  const icon = icon2Src(championIcon(item.apiName, item.icon));
  acc[item.name?.toLowerCase()] = icon;
  acc[item.apiName?.toLowerCase()] = icon;

  return acc;
}

const champMapping: Record<string, string> = {
  tft7_dragonblue: 'tft7_miragedragon',
  tft7_dragongold: 'tft7_shimmerscaledragon',
  tft7_dragongreen: 'tft7_jadedragon',
  tft7_dragonpurple: 'tft7_whispersdragon',
  tft7_aquaticdragon: 'tft7_sohm',
  tft7_nomsyevoker: 'tft7_nomsy',
  tft7_nomsymage: 'tft7_nomsy',
  tft7_nomsycannoner: 'tft7_nomsy',
};

function championIcon(apiName: string, icon: string): string {
  const an = apiName.toLowerCase();
  let san = champMapping[an] || an;
  let sn = CurrentSet.toLowerCase();
  if (icon.toLowerCase().includes('_stage2')) {
    sn += '_stage2';
  }

  return `assets/characters/${an}/hud/${san}.${sn}.png`;
}

export function icon2Src(icon: string): string {
  const prefix = `https://raw.communitydragon.org/${CDragonVersion}/game/`;
  const ico = icon
    .toLowerCase()
    .replace('.dds', '.png')
    .replace('.tex', '.png');
  const src = `${prefix}${ico}`;

  return src;
}

const mappings: Mappings = {
  items: data.items.reduce(toMappings, {}),
  traits: setData.traits.reduce(toMappings, {}),
  championsL: setData.champions.reduce(toMappings, {}),
  champions: setData.champions.reduce(toMappingsChamp, {}),
};

console.log(mappings);

export function iconFor(folder: string, name: string): string {
  const n = name.toLowerCase();

  switch (folder) {
    case 'aug': {
      return mappings.items[n];
    }
    case 'item': {
      return mappings.items[n];
    }
    case 'trait': {
      return mappings.traits[n];
    }
    case 'champ': {
      return mappings.champions[n];
    }
    default: {
      return n;
    }
  }
}
