import contentMetadata from './data/content-metadata.json';

export const TFTSet = '8';
export const TFTSetNumber = 8;
export const TFTVersion =
  contentMetadata.version.match(/^(\d+\.\d+)\.\d+\+.*/)!![1];
export const TFTBuild =
  contentMetadata.version.match(/^\d+\.\d+\.(\d+)\+.*/)!![1];
export const CDragonVersion = contentMetadata.version.includes('.beta')
  ? 'pbe'
  : 'latest';
export const isPBE = contentMetadata.version.includes('.beta')
  ? `${TFTBuild}-PBE`
  : '';
export const StorageKey = `${TFTSet}-${TFTVersion}${isPBE}`;
