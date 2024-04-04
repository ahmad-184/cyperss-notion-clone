import { UserSession } from "@/types";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "../ui/DropdownMenu";
import Image from "next/image";

const UserAvatar = ({ user }: { user: UserSession["user"] }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="relative">
          <Image
            src={
              "https://utfs.io/f/18d7227d-e478-4c5f-857c-14c8c63e7066-pv8ciq.jpg"
            }
            alt={`${user?.name} profile avatar`}
            width={60}
            height={60}
            className="object-cover"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 py-1">
        <DropdownMenuGroup>
          <a href={"/dashboard"}>
            <DropdownMenuItem>Go to Dashboard</DropdownMenuItem>
          </a>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
