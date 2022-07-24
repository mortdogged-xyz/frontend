export const isFirefox =
  (window as { [key: string]: any })['InstallTrigger'] !== undefined;
