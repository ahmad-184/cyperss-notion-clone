"use client";

import { Briefcase, Trash } from "lucide-react";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { useAppSelector } from "@/store";
import WorkspaceLogoInput from "../custom-inputs/WorkspaceLogoInput";
import { Subscription } from "@prisma/client";
import { User, WorkspaceTypes } from "@/types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import PermissionSelectBox from "../PermissionSelectBox";
import { useForm } from "react-hook-form";
import { WorkspaceSettingsValidator } from "@/lib/validations";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectCollaborators from "../select-collaborators";
import { Skeleton } from "../ui/Skeleton";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import ButtonWithLoaderAndProgress from "../ButtonWithLoaderAndProgress";
import {
  getFullDataWorkspaceByIdAction,
  updateWorkspaceAction,
} from "@/server-actions";
import { useDispatch } from "react-redux";
import { replaceWorkspace } from "@/store/slices/workspace";
import useUploadV2 from "@/hooks/useUploadV2";
import EmojiPickerMart from "../EmojiPickerMart";
import { useRouter } from "next/navigation";
import { Context as SocketContext } from "@/contexts/socket-provider";
import Image from "next/image";
import Logo from "@/assets/cypresslogo.svg";

interface WorkspaceSettingsProps {
  subscription: Subscription | null;
  user: User;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  user,
  subscription,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { current_workspace, loading } = useAppSelector(
    (store) => store.workspace
  );
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    User[] | []
  >([]);
  const [emoji, setEmoji] = useState(current_workspace?.iconId);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [isWorkspaceNameChange, setIsWorkspaceNameChange] = useState(false);
  const [isWorkspaceLogoChanged, setIsWorkspaceLogoChanged] = useState(false);
  const [isWorkspaceEmojiChange, setIsWorkspaceEmojiChange] = useState(false);
  const [isWorkspaceTypeChange, setIsWorkspaceTypeChange] = useState(false);
  const [isWorkspaceCollaboratorsChange, setIsWorkspaceCollaboratorsChange] =
    useState(false);

  const { socket } = useContext(SocketContext);

  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const { startUpload, files, isUploading, progress } = useUploadV2({
    ref: inputRef,
    max_size: 1,
  });

  useEffect(() => {
    (async () => {
      if (current_workspace && files[0]) {
        const uploadedLogo = await startUpload();
        if (uploadedLogo) {
          setValue("logo", uploadedLogo[0].file.secure_url);
        }
      }
    })();
  }, [files, current_workspace]);

  const { validator } = WorkspaceSettingsValidator(t);
  type WorkspaceSettingsValidatorType = z.infer<typeof validator>;

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    register,
    setValue,
    watch,
  } = useForm<WorkspaceSettingsValidatorType>({
    defaultValues: {
      type: current_workspace?.type,
      workspace_name: current_workspace?.title,
      logo: current_workspace?.logo,
    },
    mode: "onSubmit",
    resolver: zodResolver(validator),
  });

  useEffect(() => {
    if (!current_workspace) return;
    setValue("type", current_workspace.type);
    setValue("workspace_name", current_workspace.title);
    setSelectedCollaborators(
      current_workspace.collaborators?.map((e) => e.user) || []
    );
    setEmoji(current_workspace.iconId);
  }, [current_workspace]);

  const handleChangePermission = (e: WorkspaceTypes["type"]) => {
    setValue("type", e);
  };

  const getValue = (data: User[] | []) => {
    setSelectedCollaborators(data);
  };

  const typeValue = watch("type");
  const workspaceNameValue = watch("workspace_name");
  const logo = watch("logo");

  const handleChangeEmoji = (e: string) => {
    setEmoji(e);
  };

  const handlDeleteLogo = () => setValue("logo", "");

  const onSubmit = async (data: WorkspaceSettingsValidatorType) => {
    try {
      if (!current_workspace) return;
      setSaveLoading(true);
      setError("");
      const payload = {
        id: current_workspace.id,
        title: data.workspace_name,
        type: data.type,
        logo: data.logo,
        iconId: emoji || "",
      };

      if (data.type === "shared" && !selectedCollaborators.length)
        return setError("Atleast 1 collaborator required");

      const { data: res, error } = await updateWorkspaceAction({
        workspaceId: current_workspace.id,
        data: payload,
        collaborators: selectedCollaborators,
      });

      if (error || !res) {
        console.log(error);
        toast.error("Something went wrong, please try again");

        return;
      }

      const fetWorkspaceData = await getFullDataWorkspaceByIdAction(res.id);

      if (fetWorkspaceData.error || !fetWorkspaceData.data) {
        console.log(error);
        toast.error("Something went wrong, please try again");

        return;
      }

      if (
        current_workspace.id &&
        current_workspace.type === "shared" &&
        socket &&
        socket.connected
      ) {
        socket.emit(
          "update_workspace_settings",
          current_workspace.id,
          fetWorkspaceData.data,
          user.id
        );
      }
      dispatch(replaceWorkspace(fetWorkspaceData.data));
      router.refresh();
    } catch (err: any) {
      console.log(err);
      toast.error("Could not update the changes");
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    if (!current_workspace) return;

    if (workspaceNameValue !== current_workspace.title) {
      setIsWorkspaceNameChange(true);
    } else setIsWorkspaceNameChange(false);
  }, [workspaceNameValue, current_workspace]);

  useEffect(() => {
    if (!current_workspace) return;

    if (current_workspace.type !== typeValue) {
      setIsWorkspaceTypeChange(true);
    } else setIsWorkspaceTypeChange(false);
  }, [typeValue, current_workspace]);

  useEffect(() => {
    if (!current_workspace) return;

    if (current_workspace.logo !== logo) {
      setIsWorkspaceLogoChanged(true);
    } else setIsWorkspaceLogoChanged(false);
  }, [logo, current_workspace]);

  useEffect(() => {
    if (!current_workspace) return;
    if (typeValue !== "shared" && current_workspace.type === "private") {
      setIsWorkspaceCollaboratorsChange(false);

      return;
    }

    const currentState =
      current_workspace.collaborators?.map((e) => e.user) || [];

    let has: boolean = false;

    for (const p of selectedCollaborators) {
      if (!has) {
        for (const e of currentState) {
          if (!has) {
            if (e.id === p.id) {
              has = true;
            }
          }
        }
      }
    }

    if (!has || currentState.length !== selectedCollaborators.length) {
      setIsWorkspaceCollaboratorsChange(true);
      setError("");
    } else {
      setIsWorkspaceCollaboratorsChange(false);
      setError("");
    }
  }, [current_workspace, selectedCollaborators, typeValue]);

  useEffect(() => {
    if (!current_workspace) return;
    if (emoji !== current_workspace.iconId) {
      setIsWorkspaceEmojiChange(true);
    } else setIsWorkspaceEmojiChange(false);
  }, [current_workspace, emoji]);

  const isStateChanged = useMemo(() => {
    return [
      isWorkspaceNameChange,
      isWorkspaceTypeChange,
      isWorkspaceCollaboratorsChange,
      isWorkspaceEmojiChange,
      isWorkspaceLogoChanged,
    ].some((e) => e === true);
  }, [
    isWorkspaceNameChange,
    isWorkspaceTypeChange,
    isWorkspaceCollaboratorsChange,
    isWorkspaceEmojiChange,
    isWorkspaceLogoChanged,
  ]);

  const handleCancelChanges = () => {
    if (!current_workspace) return;
    if (!isStateChanged) return;
    setValue("workspace_name", current_workspace?.title);
    setValue("type", current_workspace?.type);
    setValue("logo", current_workspace.logo);
    // if (isWorkspaceCollaboratorsChange && typeValue === "shared") {
    setSelectedCollaborators(
      current_workspace.collaborators?.map((e) => e.user)
    );
    // }
    setEmoji(current_workspace.iconId);
  };

  if (loading || !current_workspace)
    return (
      <div className="w-full h-[400px] rounded-md">
        <Skeleton className="w-full h-full p-4 py-6" />
      </div>
    );

  return (
    <div className="w-full rounded-md z-[1] bg-white dark:bg-black/15 border">
      <div
        className="p-5 py-6 flex flex-col lg:flex-row items-stretch lg:items-start w-full gap-7
        lg:gap-[8rem] xl:gap-[12rem] 2xl:gap-[17rem]
      "
      >
        <p className="flex items-center gap-2 text-sm dark:text-gray-300">
          <span>
            <Briefcase size={20} />
          </span>
          Workspace settings
        </p>
        <form
          id="settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-grow flex-col gap-5"
        >
          <div className="flex flex-grow gap-3 items-start">
            <EmojiPickerMart
              onChangeEmoji={handleChangeEmoji}
              emoji={emoji || ""}
              classNames="text-[40px] sm:text-[50px]"
            />
            <div className="flex flex-grow flex-col gap-1">
              <Label htmlFor={"workspace_name"}>Workspace name</Label>
              <Input
                {...register("workspace_name")}
                defaultValue={current_workspace?.title}
                placeholder="Untitled"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* {logo ? ( */}
            <div className="w-14 h-14 relative left-1 rounded-full outline-dashed outline-[1.3px] dark:outline-gray-500 outline-offset-8">
              <Image
                src={logo || Logo}
                fill
                alt={`${current_workspace?.title} logo`}
              />
              {logo ? (
                <div className="absolute bg-muted-foreground/40 rounded-full visible opacity-100 transition-all duration-300 md:opacity-0 md:hover:visible md:hover:opacity-100  flex inset-0 w-full h-full items-center justify-center">
                  <Button
                    type="button"
                    onClick={handlDeleteLogo}
                    size={"sm"}
                    variant="ghost"
                    className="w-7 h-7"
                  >
                    <div>
                      <Trash className="w-5 h-5 dark:text-gray-300" />
                    </div>
                  </Button>
                </div>
              ) : null}
            </div>
            {/* ) : null} */}
            <div className="flex-grow">
              <WorkspaceLogoInput subscription={subscription} ref={inputRef} />
            </div>
          </div>
          <PermissionSelectBox
            handleChange={handleChangePermission}
            value={typeValue}
          />
          {typeValue === "shared" ? (
            <>
              <div className="my-1">
                <SelectCollaborators
                  selectedCollaborators={selectedCollaborators || []}
                  getValue={getValue}
                />
              </div>
            </>
          ) : null}
          {error ? (
            <small className="text-xs text-rose-500">{error}</small>
          ) : null}
        </form>
      </div>
      <hr />
      <div className="p-5 py-4 flex gap-2 justify-end items-center w-full">
        {isStateChanged ? (
          <Button
            className="text-xs"
            form="settings-form"
            type="button"
            size="sm"
            variant={"secondary"}
            disabled={!isStateChanged || saveLoading}
            onClick={handleCancelChanges}
          >
            Cancel
          </Button>
        ) : null}
        <ButtonWithLoaderAndProgress
          className="text-xs"
          form="settings-form"
          type="submit"
          size="sm"
          variant={"default"}
          disabled={!isStateChanged || saveLoading}
          loading={saveLoading}
          isUploading={isUploading}
          progress={progress}
        >
          Save
        </ButtonWithLoaderAndProgress>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
