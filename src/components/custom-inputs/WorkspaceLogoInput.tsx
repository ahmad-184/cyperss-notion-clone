import { OctagonAlert } from "lucide-react";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { forwardRef } from "react";
import { Subscription } from "@prisma/client";

interface WorkspaceLogoInputProps {
  subscription: Subscription | null;
}

type Ref = HTMLInputElement;

const WorkspaceLogoInput = forwardRef<Ref, WorkspaceLogoInputProps>(
  ({ subscription }, ref) => {
    return (
      <div className="">
        <Label htmlFor="logo">Workspace Logo</Label>
        <Input
          name="logo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          ref={ref}
          disabled={subscription?.status !== "active"}
        />
        {subscription?.status !== "active" ? (
          <div className="text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-2">
            <OctagonAlert className="w-4 h-4" />
            <small className="underline">
              Only Pro Plan users can have customn logo
            </small>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-500 flex relative items-center gap-1 mt-2">
            <OctagonAlert className="w-4 h-4" />
            <small className="underline">Maximum image size 1MB</small>
          </div>
        )}
      </div>
    );
  }
);

export default WorkspaceLogoInput;
