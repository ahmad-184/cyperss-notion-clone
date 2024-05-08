import { Lock, Share } from "lucide-react";
import { Label } from "./ui/Label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { WorkspaceTypes } from "@/types";

interface PermissionSelectBox {
  value: WorkspaceTypes["type"];
  handleChange: (e: WorkspaceTypes["type"]) => void;
}

const PermissionSelectBox: React.FC<PermissionSelectBox> = ({
  value,
  handleChange,
}) => {
  return (
    <div className="w-full">
      <Label>Permission</Label>
      <Select
        onValueChange={(e: WorkspaceTypes["type"]) => {
          handleChange(e);
        }}
        value={value}
      >
        <SelectTrigger className="w-full h-fit">
          <SelectValue placeholder="Select a Permission" />
        </SelectTrigger>
        <SelectContent className="max-w-[90vw]">
          <SelectGroup>
            <SelectItem value="private">
              <div className="flex items-center w-full gap-4 p-1">
                <div>
                  <Lock size={20} />
                </div>
                <div className="flex flex-col text-left">
                  <span>Private</span>
                  <p>
                    Your workspace is private to you. you can choose to share it
                    later.
                  </p>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="shared">
              <div className="flex items-center gap-4 p-1">
                <div>
                  <Share size={20} />
                </div>
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
  );
};

export default PermissionSelectBox;
