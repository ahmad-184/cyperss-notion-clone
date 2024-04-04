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

export const setupWorkspaceValidator = (t: TFunction) => {
  const validator = z.object({
    name: z
      .string()
      .min(3, { message: "Workspace name must have more than 3 characters." })
      .max(30, {
        message: "Workspace name can not have more than 30 characters.",
      }),
  });
  return { validator };
};
