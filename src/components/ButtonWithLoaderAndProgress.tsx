import type { VariantProps } from "class-variance-authority";
import Loader from "./Loader";
import { Button } from "./ui/Button";
import { buttonVariants } from "./ui/Button";
import { Progress } from "@/components/ui/Progress";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  isUploading?: boolean;
  progress?: number;
}

const ButtonWithLoader: React.FC<Props> = ({
  loading,
  isUploading,
  progress,
  children,
  ...props
}) => {
  return (
    <Button className="mt-4 w-full disabled:opacity-100" {...props}>
      {!isUploading && loading ? <Loader className="w-7" /> : null}
      {isUploading ? <Progress value={progress} className="w-[80%]" /> : null}
      {!isUploading && !loading ? children : null}
    </Button>
  );
};

export default ButtonWithLoader;
