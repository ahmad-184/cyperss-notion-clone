import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { z } from "zod";
import { Button } from "../ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Lock, Share } from "lucide-react";
import SelectCollaborators from "../select-collaborators";
import { useState } from "react";
import { User } from "@/types";
import { workspace as Workspace } from "@prisma/client";
import { useSession } from "next-auth/react";
import { createCollaborators, createWorkspace } from "@/server-actions";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { addWorkspace, setCurrentWorkspace } from "@/store/slices/workspace";
import { useRouter } from "next/navigation";
import ButtonWithLoader from "../ButtonWithLoaderAndProgress";

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

type WorkspaceType = Pick<ValidatorTypes, "type">;

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = () => {
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    User[] | []
  >([]);
  const [error, setError] = useState("");
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

  const onSubmit = async (data: ValidatorTypes) => {
    try {
      const type = data.type;
      if (!session?.user) return;
      const workspacePayload: Omit<Workspace, "createdAt"> = {
        id: uuidv4(),
        type,
        bannerUrl: "",
        data: null,
        iconId: "",
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

      dispatch(
        addWorkspace({
          type: newWorkspaceData.type,
          data: newWorkspaceData,
        })
      );
      router.push(`/dashboard/${newWorkspaceData.id}`);

      return toast.success("Workspace created successfully");
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
        <div className="w-full">
          <Label htmlFor="name">Name</Label>
          <Input {...register("name")} placeholder="awesome workspace..." />
          {errors.name ? (
            <small className="text-destructive ml-1">
              {errors.name.message}
            </small>
          ) : null}
        </div>
        <div className="w-full">
          <Label>Permission</Label>
          <Select
            onValueChange={(e: WorkspaceType["type"]) => {
              setValue("type", e);
            }}
            defaultValue={typeValue}
          >
            <SelectTrigger className="w-full h-fit">
              <SelectValue placeholder="Select a Permission" />
            </SelectTrigger>
            <SelectContent className="max-w-[90vw]">
              <SelectGroup>
                <SelectItem value="private">
                  <div className="flex items-center w-full gap-4 p-1">
                    <Lock />
                    <div className="flex flex-col text-left">
                      <span>Private</span>
                      <p>
                        Your workspace is private to you. you can choose to
                        share it later.
                      </p>
                    </div>
                  </div>
                </SelectItem>

                <SelectItem value="shared">
                  <div className="flex items-center gap-4 p-1">
                    <Share />
                    <div className="flex flex-col text-left">
                      <span className="">Shared</span>
                      <p>You can invite collaborators.</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {typeValue === "shared" ? (
          <div className="my-1">
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
      <ButtonWithLoader className="w-full" type="submit" loading={isSubmitting}>
        Create
      </ButtonWithLoader>
    </form>
  );
};

export default WorkspaceCreator;
