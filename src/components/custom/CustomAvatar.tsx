import { User } from "@/types";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface CustomAvatarProps {
  user: User;
  className?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  user,
  className,
  onClick,
  width,
  height,
}) => {
  const fallbackName = user?.name
    ?.split(" ")
    .map((e) => e.split(""))
    .map((e) => e[0])
    .join("");

  return (
    <Avatar className={cn("relative", className)} onClick={onClick}>
      {user?.image ? (
        <Image
          src={user.image}
          alt={`${user?.name} profile`}
          fill
          className="object-cover w-full h-full"
        />
      ) : (
        <AvatarFallback className="uppercase select-none w-full h-full absolute">
          {fallbackName}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default memo(CustomAvatar);
