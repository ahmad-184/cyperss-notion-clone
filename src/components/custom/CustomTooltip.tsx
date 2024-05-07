import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";

interface CustomTooltipProps {
  description: string;
  children: React.ReactNode;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  description,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
};

export default CustomTooltip;
