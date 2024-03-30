import { TFunction } from "i18next";
import * as z from "zod";

export const signinValidator = (t: TFunction) => {
  const validator = z.object({
    email: z
      .string()
      .email({ message: t("validators:email") })
      .min(1, { message: t("validators:email-min") }),
  });
  return { validator };
};
