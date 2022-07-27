export const isFirefox =
  // eslint-disable-next-line
  (window as {[key: string]: any})['InstallTrigger'] !== undefined;
