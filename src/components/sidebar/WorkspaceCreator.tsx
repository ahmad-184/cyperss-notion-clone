import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectCollaborators from "../select-collaborators";
import { useState } from "react";
import { User, WorkspacePayload, WorkspaceTypes } from "@/types";
import { useSession } from "next-auth/react";
import {
  createCollaborators,
  createWorkspace,
  getWorkspaceById,
} from "@/server-actions";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { addWorkspace } from "@/store/slices/workspace";
import { useRouter } from "next/navigation";
import ButtonWithLoaderAndProgress from "../ButtonWithLoaderAndProgress";
import PermissionSelectBox from "../PermissionSelectBox";
import EmojiPicker from "../EmojiPicker";
import type { EmojiClickData } from "emoji-picker-react";

interface WorkspaceCreatorProps {}

const validator = z.object({
  name: z
    .string()
    .min(3, { message: "Workspace name must have more than 3 characters." })
    .max(30, {
      message: "Workspace name can not have more than 30 characters.",
    }),
  type: z.enum(["private", "shared"]),
});

type ValidatorTypes = z.infer<typeof validator>;

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = () => {
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    User[] | []
  >([]);
  const [error, setError] = useState("");
  const [emoji, setEmoji] = useState("💼");
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    formState: { isSubmitting, errors },
    watch,
    handleSubmit,
    setValue,
  } = useForm<ValidatorTypes>({
    defaultValues: {
      name: "",
      type: "private",
    },
    resolver: zodResolver(validator),
  });

  const handleChangePermission = (e: WorkspaceTypes["type"]) => {
    setValue("type", e);
  };

  const handleChangeEmoji = (e: EmojiClickData) => {
    setEmoji(e.emoji);
  };

  const onSubmit = async (data: ValidatorTypes) => {
    try {
      const type = data.type;
      if (!session?.user) return;
      const workspacePayload: WorkspacePayload = {
        id: uuidv4(),
        type,
        bannerUrl: "",
        data: null,
        iconId: emoji,
        inTrash: false,
        logo: "",
        title: data.name,
        workspaceOwnerId: session.user.id as string,
      };

      if (type === "shared" && !selectedCollaborators.length) {
        setError("Atleast 1 collabrator required.");
      }

      const { error: newWorkspaceError, data: newWorkspaceData } =
        await createWorkspace(workspacePayload);
      if (newWorkspaceError)
        throw new Error(newWorkspaceError?.message as string);

      if (!newWorkspaceData?.id) return;

      if (type === "shared" && selectedCollaborators.length) {
        const {
          data: workspaceCollaboratorsData,
          error: workspaceCollaboratorsError,
        } = await createCollaborators({
          workspaceId: newWorkspaceData.id,
          collaborators: selectedCollaborators,
        });
        if (error) throw new Error(workspaceCollaboratorsError?.message);
      }

      const { data: dataToStore, error: err } = await getWorkspaceById(
        newWorkspaceData.id
      );

      if (err) {
        console.log(error);
        toast.error("Colud not fetch workspace");
      }

      if (dataToStore?.id) {
        dispatch(
          addWorkspace({
            data: dataToStore,
          })
        );
        router.push(`/dashboard/${newWorkspaceData.id}`);

        return toast.success("Workspace created successfully");
      } else {
        toast.error("Something went wrong");
        router.push(`/dashboard/${newWorkspaceData.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong, please try again");
    }
  };

  const getValue = (data: User[] | []) => {
    setSelectedCollaborators(data);
  };

  const typeValue = watch("type");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full gap-3"
    >
      <div className="flex flex-col gap-3">
        <div className="w-full flex gap-3 items-center">
          <EmojiPicker
            handleChangeEmoji={handleChangeEmoji}
            emoji={emoji}
            classNames="text-[40px] sm:text-[50px]"
          />
          <div className="flex-grow">
            <Label htmlFor="name">Name</Label>
            <Input {...register("name")} placeholder="awesome workspace..." />
            {errors.name ? (
              <small className="text-destructive ml-1">
                {errors.name.message}
              </small>
            ) : null}
          </div>
        </div>
        <PermissionSelectBox
          defaultValue={"private"}
          handleChange={handleChangePermission}
        />
        {typeValue === "shared" ? (
          <div className="my-1 mb-3">
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
        className="w-full"
        type="submit"
        loading={isSubmitting}
      >
        Create
      </ButtonWithLoaderAndProgress>
    </form>
  );
};

export default WorkspaceCreator;
