export const getDirByLang = (locale: string): "rtl" | "ltr" => {
  let dir: "rtl" | "ltr";

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
