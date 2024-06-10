import { OctagonAlert } from "lucide-react";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { forwardRef } from "react";
import { Subscription } from "@prisma/client";
import { useTranslation } from "react-i18next";

interface WorkspaceLogoInputProps {
  subscription: Subscription | null;
}

type Ref = HTMLInputElement;

const WorkspaceLogoInput = forwardRef<Ref, WorkspaceLogoInputProps>(
  ({ subscription }, ref) => {
    const { t } = useTranslation();

    return (
      <div className="">
        <Label htmlFor="logo">{t("dashboard:workspace-logo")}</Label>
        <Input
          name="logo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          ref={ref}
          // disabled={subscription?.status !== "active"}
        />
        {/* {subscription?.status !== "active" ? (
          <div className="text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-2">
            <OctagonAlert className="w-4 h-4" />
            <small className="underline">
              Only Pro Plan users can have custom logo
            </small>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-500 flex relative items-center gap-1 mt-2">
            <OctagonAlert className="w-4 h-4" />
            <small className="underline">Maximum image size 1MB</small>
          </div>
        )} */}
      </div>
    );
  }
);

export default WorkspaceLogoInput;
