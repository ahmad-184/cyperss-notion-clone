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
import { createWorkspace } from "@/server-actions";
import { useAppDispatch } from "@/store";
import { addWorkspace } from "@/store/slices/workspace";
import { useRouter } from "next/navigation";

interface DashboardSetupProps {
  subscription: Subscription | null;
  user: UserSession["user"];
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
}) => {
  const dispatch = useAppDispatch();
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
      name: "",
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
    // type NewType =
    try {
      let payload: Omit<Workspace, "createdAt"> = {
        title: data.name,
        workspaceOwnerId: user?.id!,
        iconId: emoji,
        inTrash: false,
        bannerUrl: "",
        logo: "",
        data: null,
        id: uuid4(),
      };

      if (files[0]) {
        if (subscription?.status !== "active") return;
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          payload.logo = uploadedLogo.cdnUrl;
        }
      }

      const { data: resData, error } = await createWorkspace(payload);

      if (error) return toast.error(error.message);
      if (resData) {
        dispatch(addWorkspace(resData));
        router.replace(`dashboard/${resData.id}`);
      } else throw new Error();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <Card className="max-w-[600px] h-auto">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started. You can add
          collaborators later from the workspace setting tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <EmojiPicker
                handleChangeEmoji={handleChangeEmoji}
                emoji={emoji}
              />
              <Input {...register("name")} placeholder="Your Workspace Name" />
            </div>
            {errors.name ? (
              <small className="text-destructive">{errors.name.message}</small>
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
