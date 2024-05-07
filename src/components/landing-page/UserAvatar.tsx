import { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../ui/DropdownMenu";
import CustomAvatar from "../custom/CustomAvatar";
import { logOutUser } from "@/lib/utils";
import React from "react";

interface UserAvatarProps {
  user: User;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <CustomAvatar
          user={user!}
          className="cursor-pointer outline-none border-none"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 py-1">
        <DropdownMenuGroup>
          <a href={"/dashboard"}>
            <DropdownMenuItem>Go to Dashboard</DropdownMenuItem>
          </a>
          <DropdownMenuItem onClick={logOutUser}>Sign Out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
