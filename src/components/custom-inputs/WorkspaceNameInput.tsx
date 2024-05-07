import React from "react";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

interface WorkspaceNameInputProps
  extends React.HTMLAttributes<HTMLInputElement> {
  name: string;
}

const WorkspaceNameInput: React.FC<WorkspaceNameInputProps> = ({
  name,
  ...props
}) => {
  return (
    <div className="flex flex-grow flex-col gap-1">
      <Label htmlFor={name}>Workspace Name</Label>
      <Input {...props} />
    </div>
  );
};

export default WorkspaceNameInput;
