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
    workspace_name: z.string().max(30, {
      message: "Workspace name can not have more than 30 characters.",
    }),
    username: z
      .string()
      .min(3, { message: "Name must have more than 3 characters." })
      .max(30, {
        message: "Name can not have more than 30 characters.",
      })
      .nullable()
      .optional(),
  });
  return { validator };
};

export const WorkspaceSettingsValidator = (t: TFunction) => {
  const validator = z.object({
    workspace_name: z.string().max(30, {
      message: "Workspace name can not have more than 30 characters.",
    }),
    type: z.enum(["private", "shared"]),
  });
  return { validator };
};

export const changeItemTitleActionValidator = z.object({
  type: z.enum(["folder", "file", "workspace"], {
    description: "data type required",
  }),
  id: z.string().min(1, { message: "id is required" }),
  title: z.string(),
});
