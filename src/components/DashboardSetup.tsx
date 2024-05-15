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
import EmojiPicker from "./EmojiPicker";
import { useEffect, useRef, useState } from "react";
import type { EmojiClickData } from "emoji-picker-react";
import { Label } from "./ui/Label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { setupWorkspaceValidator } from "@/lib/validations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ButtonWithLoaderAndProgress from "./ButtonWithLoaderAndProgress";
import { createWorkspace, updateUserDetail } from "@/server-actions";
import { useRouter } from "next/navigation";
import WorkspaceNameInput from "./custom-inputs/WorkspaceNameInput";
import WorkspaceLogoInput from "./custom-inputs/WorkspaceLogoInput";
import AppLogo from "./AppLogo";
import { cn } from "@/lib/utils";
import { getDirByLang } from "@/lib/dir";
import useUploadV2 from "@/hooks/useUploadV2";

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
    },
    mode: "onSubmit",
    resolver: zodResolver(validator),
  });

  useEffect(() => {
    const isFirstLook = window.localStorage.getItem("FIRST_LOOK");
    if (!isFirstLook) {
      setTimeout(() => {
        toast("Welcome to Cypress", {
          icon: "🎉",
          description: "Here you can setup your first Workspace",
          position: "top-center",
        });
      }, 1000);
      window.localStorage.setItem("FIRST_LOOK", "true");
    }
  }, []);

  const handleChangeEmoji = (e: EmojiClickData) => {
    setEmoji(e.emoji);
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
      };

      if (files[0]) {
        if (subscription?.status !== "active") return;
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          payload.logo = uploadedLogo[0].file.secure_url;
        }
      }

      if (!user.name && data.username) {
        await updateUserDetail({ name: data.username, id: user.id });
      }

      const { data: resData, error } = await createWorkspace(payload);

      if (error) return toast.error(error.message);
      if (resData) {
        router.refresh();
      } else throw new Error();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong, please try again.");
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
          <CardTitle>Setup Your First Workspace</CardTitle>
          <CardDescription>
            Lets create a private workspace to get you started. You can add
            collaborators later from the workspace setting tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <div className="w-full mb-2">
                <Label htmlFor="username">Your Name</Label>
                <Input
                  {...register("username")}
                  className="w-full"
                  placeholder="koorosh..."
                />
              </div>
              <div className="flex gap-3 items-center">
                <EmojiPicker
                  handleChangeEmoji={handleChangeEmoji}
                  emoji={emoji}
                  classNames="text-[40px] sm:text-[50px]"
                />
                <div className="flex flex-grow flex-col gap-1">
                  <Label htmlFor={"workspace_name"}>Workspace Name</Label>
                  <Input
                    {...register("workspace_name")}
                    placeholder="something awesome..."
                  />
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
              Create
            </ButtonWithLoaderAndProgress>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardSetup;
