"use client";
import { v4 as uuid4 } from "uuid";
import type { Subscription } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { UserSession, WorkspacePayload } from "@/types";
import { Input } from "./ui/Input";
import { useEffect, useRef, useState } from "react";
import { Label } from "./ui/Label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { setupWorkspaceValidator } from "@/lib/validations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ButtonWithLoaderAndProgress from "./ButtonWithLoaderAndProgress";
import {
  createWorkspaceAction,
  updateUserDetailAction,
} from "@/server-actions";
import { useRouter } from "next/navigation";
import WorkspaceLogoInput from "./custom-inputs/WorkspaceLogoInput";
import AppLogo from "./AppLogo";
import { cn } from "@/lib/utils";
import { getDirByLang } from "@/lib/dir";
import useUploadV2 from "@/hooks/useUploadV2";
import EmojiPickerMart from "./EmojiPickerMart";

interface DashboardSetupProps {
  subscription: Subscription | null;
  user: UserSession["user"];
  locale: string;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
  locale,
}) => {
  const router = useRouter();

  const [emoji, setEmoji] = useState("💼");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const { startUpload, files, isUploading, progress } = useUploadV2({
    ref: inputRef,
    max_size: 1,
  });

  const { validator } = setupWorkspaceValidator(t);
  type setupWorkspaceValidatorType = z.infer<typeof validator>;

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    register,
  } = useForm<setupWorkspaceValidatorType>({
    defaultValues: {
      workspace_name: "",
      username: user?.name,
      type: "private",
    },
    mode: "onSubmit",
    resolver: zodResolver(validator),
  });

  useEffect(() => {
    const isFirstLook = window.localStorage.getItem("FIRST_LOOK");
    if (!isFirstLook) {
      setTimeout(() => {
        toast(t("dashboard:wellcome-to-cypress"), {
          icon: "🎉",
          description: t("dashboard:wellcome-to-cypress-desc"),
          position: "top-center",
        });
      }, 1000);
      window.localStorage.setItem("FIRST_LOOK", "true");
    }
  }, []);

  const handleChangeEmoji = (e: string) => {
    setEmoji(e);
  };

  const onSubmit = async (data: setupWorkspaceValidatorType) => {
    try {
      if (!user?.id) return;
      let payload: WorkspacePayload = {
        id: uuid4(),
        title: data.workspace_name,
        workspaceOwnerId: user.id!,
        iconId: emoji,
        inTrash: false,
        bannerUrl: "",
        banner_public_id: "",
        logo: "",
        data: null,
        type: "private",
        // accessibility: "all",
      };

      if (files[0]) {
        if (subscription?.status !== "active") return;
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          payload.logo = uploadedLogo[0].file.secure_url;
        }
      }

      if (!user.name && data.username) {
        await updateUserDetailAction({ name: data.username, id: user.id });
      }

      const { data: resData, error } = await createWorkspaceAction(payload);

      if (error) return toast.error(error.message);
      if (resData) {
        toast.success(t("dashboard:workspace-created-successfully"));
        router.refresh();
      } else throw new Error();
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:error-message"));
    }
  };

  return (
    <>
      <AppLogo
        t={t}
        className={cn("fixed top-4 md:top-6", {
          "left-4 md:left-12": getDirByLang(locale as string) === "ltr",
          "right-4 md:right-12": getDirByLang(locale as string) === "rtl",
        })}
      />
      <Card className="max-w-[600px] h-auto">
        <CardHeader>
          <CardTitle>{t("dashboard:setup-your-first-workspace")}</CardTitle>
          <CardDescription>
            {t("dashboard:setup-new-workspace-desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <div className="w-full mb-2">
                <Label htmlFor="username">{t("dashboard:your-name")}</Label>
                <Input {...register("username")} className="w-full" />
              </div>
              <div className="flex gap-3 items-center">
                <EmojiPickerMart
                  onChangeEmoji={handleChangeEmoji}
                  emoji={emoji}
                  classNames="text-[40px] sm:text-[50px]"
                />
                <div className="flex flex-grow flex-col gap-1">
                  <Label htmlFor={"workspace_name"}>
                    {t("dashboard:workspace-name")}
                  </Label>
                  <Input {...register("workspace_name")} />
                </div>
              </div>
              {errors.workspace_name ? (
                <small className="text-destructive">
                  {errors.workspace_name.message}
                </small>
              ) : null}
              <WorkspaceLogoInput ref={inputRef} subscription={subscription!} />
            </div>
            <ButtonWithLoaderAndProgress
              type="submit"
              className="mt-3 w-full"
              loading={isSubmitting}
              isUploading={isUploading}
              progress={progress}
            >
              {t("create")}
            </ButtonWithLoaderAndProgress>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardSetup;
