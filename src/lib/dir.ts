export const getDirByLang = (locale: string): string => {
  let dir: string;

  switch (locale) {
    case "fa":
      dir = "rtl";
      break;
    default:
      dir = "ltr";
      break;
  }

  return dir;
};
