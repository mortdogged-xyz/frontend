export const TFTSet = '8';
export const TFTSetNumber = 8;
export const TFTVersion = '12.23';
// export const CDragonVersion = 'latest';
export const CDragonVersion = 'pbe';
export const isPBE = CDragonVersion === 'pbe' ? 'PBE' : '';
export const StorageKey = `${TFTSet}-${TFTVersion}${isPBE}`;
