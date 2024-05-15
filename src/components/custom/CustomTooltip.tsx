import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";

interface CustomTooltipProps {
  description: string;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  children: React.ReactNode;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  side,
  description,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side || undefined}>{description}</TooltipContent>
    </Tooltip>
  );
};

export default CustomTooltip;
