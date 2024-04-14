"use client";
import { v4 as uuid4 } from "uuid";
import type {
  subscription as Subscription,
  workspace as Workspace,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { UserSession } from "@/types";
import { Input } from "./ui/Input";
import EmojiPicker from "./EmojiPicker";
import { useEffect, useRef, useState } from "react";
import type { EmojiClickData } from "emoji-picker-react";
import { Label } from "./ui/Label";
import { OctagonAlert } from "lucide-react";
import useUpload from "@/hooks/useUpload";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { setupWorkspaceValidator } from "@/lib/validations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ButtonWithLoaderAndProgress from "./ButtonWithLoaderAndProgress";
import { createWorkspace, updateUserDetail } from "@/server-actions";
import { useRouter } from "next/navigation";

interface DashboardSetupProps {
  subscription: Subscription | null;
  user: UserSession["user"];
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
}) => {
  const router = useRouter();

  const [emoji, setEmoji] = useState("💼");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const { startUpload, files, isUploading, progress } = useUpload({
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
      username: "",
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
      let payload: Omit<Workspace, "createdAt"> = {
        id: uuid4(),
        title: data.workspace_name,
        workspaceOwnerId: user.id!,
        iconId: emoji,
        inTrash: false,
        bannerUrl: "",
        logo: "",
        data: null,
        type: "private",
      };

      if (files[0]) {
        if (subscription?.status !== "active") return;
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          payload.logo = uploadedLogo.cdnUrl;
        }
      }

      const [updatedUser, { data: resData, error }] = await Promise.all([
        updateUserDetail({ name: data.username, id: user.id }),
        createWorkspace(payload),
      ]);

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
                <Label htmlFor="workspace_name">Workspace Name</Label>
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
            <div>
              <Label htmlFor="logo">Workspace Logo</Label>
              <Input
                name="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Logo"
                ref={inputRef}
                disabled={subscription?.status !== "active"}
              />
              {subscription?.status !== "active" ? (
                <div className="text-gray-500 dark:text-gray-500 flex relative items-center gap-1 mt-2">
                  <OctagonAlert className="w-4 h-4 bottom-[1.5px] relative" />
                  <small className="underline">
                    Only Pro Plans can choose logo
                  </small>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-500 flex relative items-center gap-1 mt-2">
                  <OctagonAlert className="w-4 h-4 bottom-[1.5px] relative" />
                  <small className="underline">Maxismum image size 1MB</small>
                </div>
              )}
            </div>
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
  );
};

export default DashboardSetup;
