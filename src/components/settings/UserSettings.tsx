import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash, User as UserIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import ButtonWithLoaderAndProgress from "../ButtonWithLoaderAndProgress";
import { Button } from "../ui/Button";
import CustomAvatar from "../custom/CustomAvatar";
import useUploadV2 from "@/hooks/useUploadV2";
import Loader from "../Loader";
import { updateUserDetailAction } from "@/server-actions";
import { useRouter } from "next/navigation";
import CustomTooltip from "../custom/CustomTooltip";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface UserSettingsProps {
  user: User;
}

const zodValidator = z.object({
  name: z
    .string()
    .min(3, { message: "name should have more than 3 characters" }),
  image: z.string().nullable().optional(),
});

type zodValidatorType = z.infer<typeof zodValidator>;

const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { startUpload, files, isUploading } = useUploadV2({
    ref: inputRef,
    max_size: 1,
  });
  const { t } = useTranslation();

  const [isNameChanged, setIsNameChanged] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<zodValidatorType>({
    defaultValues: {
      name: user.name!,
      image: user.image,
    },
    resolver: zodResolver(zodValidator),
    mode: "onSubmit",
  });

  const imageUrl = watch("image");
  const nameValue = watch("name");

  const onSubmit = async (data: zodValidatorType) => {
    try {
      setSaveLoading(true);
      const { data: resData, error } = await updateUserDetailAction({
        image: data.image,
        name: data.name,
        id: user.id,
      });
      if (error || !resData) throw new Error();

      setValue("name", resData?.name || "");
      setValue("image", resData?.image || "");

      router.refresh();
    } catch (err) {
      toast.error(t("dashboard:error-message"));
      console.log(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUploadBanner = useCallback(async () => {
    try {
      if (!user.id) return;
      if (!files.length) return;
      const uploadedFile = await startUpload();
      if (!uploadedFile?.length) return;
      const fileUrl = uploadedFile[0].file.secure_url;
      if (!fileUrl) throw new Error();
      setValue("image", fileUrl);
      return;
    } catch (err: any) {
      console.log(err);
      toast.error(t("dashboard:error-message"));
    }
  }, [files]);

  useEffect(() => {
    handleUploadBanner();
  }, [files]);

  const handleRemoveAvatar = async () => setValue("image", "");

  const handleCancelChanges = () => {
    setValue("name", user.name || "");
    setValue("image", user.image);
  };

  useEffect(() => {
    if (!user.name) return;
    if (nameValue !== user.name) setIsNameChanged(true);
    else {
      setIsNameChanged(false);
    }
  }, [user, nameValue]);

  useEffect(() => {
    if (imageUrl !== user.image) setIsImageChanged(true);
    else {
      setIsImageChanged(false);
    }
  }, [user, imageUrl]);

  const isStateChanged = useMemo(() => {
    return [isNameChanged, isImageChanged].some((e) => e === true);
  }, [isNameChanged, isImageChanged]);

  return (
    <div className="w-full rounded-md z-[1] bg-white dark:bg-black/15 border">
      <div
        className="p-5 py-6 flex flex-col lg:flex-row items-stretch lg:items-start w-full gap-7
        lg:gap-[8rem] xl:gap-[12rem] 2xl:gap-[17rem]
      "
      >
        <p className="flex items-center gap-2 text-sm dark:text-gray-300">
          <span>
            <UserIcon size={20} />
          </span>
          {t("dashboard:user")}
        </p>
        <form
          id="user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-grow flex-col gap-1"
        >
          <div className="w-full flex flex-col items-center gap-3 justify-center">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden group/avatar
                outline-dashed outline-[1px] outline-offset-8 dark:outline-gray-600 outline-gray-400
            "
            >
              <CustomAvatar
                user={{
                  image: imageUrl,
                  id: user.id,
                  email: user.email,
                  name: user.name,
                }}
                width={96}
                height={96}
                className="w-full h-full cursor-pointer"
              />
              {!isUploading ? (
                <div
                  onClick={() => {
                    if (inputRef.current) inputRef.current.click();
                  }}
                  className="absolute group-hover/avatar:opacity-100 duration-500 inset-0 w-full h-full bg-muted-foreground/80 opacity-0 transition-all flex items-center justify-center text-center cursor-pointer"
                >
                  <p className="text-xs dark:text-gray-300">
                    <Edit className="w-4 h-4 text-gray-100" />
                  </p>
                </div>
              ) : (
                <div className="absolute duration-500 inset-0 w-full h-full bg-muted-foreground/80 opacity-80 transition-all flex items-center justify-center text-center cursor-pointer">
                  <span className="w-[15px]">
                    <Loader className="w-6 h-6" />
                  </span>
                </div>
              )}
            </div>
            <input type="file" hidden ref={inputRef} />
            <div className="mt-2">
              {imageUrl ? (
                <CustomTooltip description="Remove Avatar">
                  <div
                    onClick={handleRemoveAvatar}
                    className="border rounded-md border-gray-600 p-2 hover:bg-muted-foreground/70 transition-all duration-300 cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </div>
                </CustomTooltip>
              ) : null}
            </div>
            {errors.image ? (
              <p className="text-sm text-red-400">{errors.image?.message}</p>
            ) : null}
          </div>
          <div>
            <Label>{t("dashboard:your-name")}</Label>
            <Input
              placeholder={t("dashboard:your-name")}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-red-400 ml-1">
                {errors?.name?.message}
              </p>
            ) : null}
          </div>
        </form>
      </div>
      <hr />
      <div className="p-5 py-4 flex gap-2 justify-end items-center w-full">
        {isStateChanged ? (
          <Button
            className="text-xs"
            form="user-form"
            type="button"
            size="sm"
            variant={"secondary"}
            disabled={!isStateChanged || saveLoading}
            onClick={handleCancelChanges}
          >
            {t("dashboard:cancel")}
          </Button>
        ) : null}
        <ButtonWithLoaderAndProgress
          className="text-xs"
          form="user-form"
          type="submit"
          size="sm"
          variant={"default"}
          disabled={!isStateChanged || saveLoading}
          loading={saveLoading}
        >
          {t("dashboard:save")}
        </ButtonWithLoaderAndProgress>
      </div>
    </div>
  );
};

export default UserSettings;
