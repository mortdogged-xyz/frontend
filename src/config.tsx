import { TFTSet, TFTVersion } from './version';

export let exportURL = `https://us-central1-tft-meta-73571.cloudfunctions.net/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;
export let loginURL = "https://us-central1-tft-meta-73571.cloudfunctions.net/loginV2";

if (process.env.NODE_ENV !== 'production') {
    exportURL = `http://localhost:5001/tft-meta-73571/us-central1/exportResponsesV2?TFTSet=${TFTSet}&TFTVersion=${TFTVersion}&token=`;
    loginURL = "http://localhost:5001/tft-meta-73571/us-central1/loginV2";
}
