import { TFTSet, TFTVersion } from './version';

export let exportURL = `/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;
export let loginURL = '/loginV2';
export let submitURL = '/submitV2';
export let getSavedResultsURL = '/getSavedResultsV2';

if (process.env.NODE_ENV !== 'production') {
  exportURL = `http://localhost:5001/tft-meta-73571/us-central1/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;
  loginURL = 'http://localhost:5001/tft-meta-73571/us-central1/loginV2';
  submitURL = 'http://localhost:5001/tft-meta-73571/us-central1/submitV2';
  getSavedResultsURL =
    'http://localhost:5001/tft-meta-73571/us-central1/getSavedResultsV2';
}
