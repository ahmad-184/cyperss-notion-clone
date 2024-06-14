"use client";
import { v4 as uuid4 } from "uuid";
import type { Subscription } from "@prisma/client";

import { User, UserSession, WorkspacePayload, WorkspaceTypes } from "@/types";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { setupWorkspaceValidator } from "@/lib/validations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCollaboratorsAction,
  createWorkspaceAction,
  getFullDataWorkspaceByIdAction,
} from "@/server-actions";
import { useRouter } from "next/navigation";

import useUploadV2 from "@/hooks/useUploadV2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import ButtonWithLoaderAndProgress from "@/components/ButtonWithLoaderAndProgress";
import WorkspaceLogoInput from "@/components/custom-inputs/WorkspaceLogoInput";
import EmojiPickerMart from "@/components/EmojiPickerMart";
import { useAppDispatch, useAppSelector } from "@/store";
import PermissionSelectBox from "@/components/PermissionSelectBox";
import SelectCollaborators from "@/components/select-collaborators";
import { addWorkspace } from "@/store/slices/workspace";
import { Menu } from "lucide-react";
import { useLocal } from "@/contexts/local-context";

interface NewWorkspaceProps {
  subscription: Subscription | null;
  user: UserSession["user"];
  locale: string;
  first_setup: boolean;
}

const NewWorkspace: React.FC<NewWorkspaceProps> = ({ user, subscription }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    User[] | []
  >([]);
  const [error, setError] = useState("");
  const [emoji, setEmoji] = useState("💼");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { current_workspace } = useAppSelector((store) => store.workspace);

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
    setValue,
    watch,
  } = useForm<setupWorkspaceValidatorType>({
    defaultValues: {
      workspace_name: "",
      type: "private",
    },
    mode: "onSubmit",
    resolver: zodResolver(validator),
  });

  const handleChangeEmoji = (e: string) => {
    setEmoji(e);
  };

  const handleChangePermission = (e: WorkspaceTypes["type"]) => {
    setValue("type", e);
  };

  const onSubmit = async (data: setupWorkspaceValidatorType) => {
    try {
      if (!user?.id) return;
      if (!data.type) return;

      const newId = uuid4();
      let payload: WorkspacePayload = {
        id: newId,
        title: data.workspace_name,
        workspaceOwnerId: user.id!,
        iconId: emoji,
        inTrash: false,
        bannerUrl: "",
        banner_public_id: "",
        logo: "",
        data: null,
        type: data.type || "private",
        // accessibility: "all",
      };

      if (files[0]) {
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          payload.logo = uploadedLogo[0].file.secure_url;
        }
      }

      if (data.type === "shared" && !selectedCollaborators.length)
        return setError(t("dashboard:one-collaborator-required"));

      const { error: newWorkspaceError, data: newWorkspaceData } =
        await createWorkspaceAction(payload);
      if (newWorkspaceError || !newWorkspaceData)
        throw new Error(newWorkspaceError?.message as string);

      if (!newWorkspaceData?.id) return;

      if (data.type === "shared" && selectedCollaborators.length) {
        const {
          data: workspaceCollaboratorsData,
          error: workspaceCollaboratorsError,
        } = await createCollaboratorsAction({
          workspaceId: newWorkspaceData.id,
          collaborators: selectedCollaborators,
        });
        if (error) throw new Error(workspaceCollaboratorsError?.message);
      }

      const { data: dataToStore, error: err } =
        await getFullDataWorkspaceByIdAction(newWorkspaceData.id);

      if (err || !dataToStore) {
        console.log(error);
        toast.error(t("dashboard:error-message"));
      }

      if (dataToStore?.id) {
        dispatch(
          addWorkspace({
            data: dataToStore,
          })
        );
        router.push(`/dashboard/${newWorkspaceData.id}`);

        return toast.success(t("dashboard:workspace-created"));
      } else {
        toast.error(t("dashboard:error-message"));
        router.push(`/dashboard/${newWorkspaceData.id}`);
      }
    } catch (err) {
      console.log(err);
      toast.error(t("dashboard:error-message"));
    }
  };

  const getValue = (data: User[] | []) => {
    setSelectedCollaborators(data);
  };

  const typeValue = watch("type");

  const { mobileSidebarOpen, mobile_sidebar_open } = useLocal();

  const handleCloseSidebarMobile = () => {
    if (mobile_sidebar_open) mobileSidebarOpen(false);
  };

  if (!current_workspace) return null;

  return (
    <div className="py-6 flex flex-col w-full gap-5 justify-center items-center px-3 sm:px-6">
      <Card className="max-w-[600px] h-auto bg-transparent border-0 p-0 m-0 shadow-none">
        <CardHeader className="p-0 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div
              onClick={() => {
                mobileSidebarOpen(true);
              }}
              className="md:hidden max-w-[600px] relative bottom-[2px]"
            >
              <Menu className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl">
              {t("dashboard:new-workspace")}
            </CardTitle>
          </div>
          <CardDescription>{t("dashboard:new-workspace-desc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
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
              <PermissionSelectBox
                value={typeValue}
                handleChange={handleChangePermission}
              />
              {typeValue === "shared" ? (
                <div className="my-1 mb-3 mt-3">
                  <SelectCollaborators
                    selectedCollaborators={selectedCollaborators}
                    getValue={getValue}
                  />
                </div>
              ) : null}
              {error ? (
                <small className="my-1 text-destructive">{error}</small>
              ) : null}
            </div>
            <ButtonWithLoaderAndProgress
              type="submit"
              className="mt-3 w-full"
              loading={isSubmitting}
              isUploading={isUploading}
              progress={progress}
            >
              {t("dashboard:create")}
            </ButtonWithLoaderAndProgress>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewWorkspace;
