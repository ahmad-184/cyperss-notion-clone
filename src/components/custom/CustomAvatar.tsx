import { User } from "@/types";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface CustomAvatarProps {
  user: User;
  className?: string;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({ user, className }) => {
  const fallbackName = user?.name
    ?.split(" ")
    .map((e) => e.split(""))
    .map((e) => e[0])
    .join("");

  return (
    <Avatar className={cn("relative", className)}>
      {user?.image ? (
        <Image
          src={user.image}
          alt={`${user?.name} profile`}
          width={60}
          height={60}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="uppercase select-none">
        {fallbackName}
      </AvatarFallback>
    </Avatar>
  );
};

export default memo(CustomAvatar);
